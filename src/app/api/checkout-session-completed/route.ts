import Stripe from "stripe";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { buildOrderConfirmationEmail, sessionLocale } from "@/lib/emails/order-confirmation";
import { lineItemsForStorage } from "@/lib/emails/line-items";
import { mailFrom, REPLY_TO } from "@/lib/emails/sender";
import { recordEvent } from "@/lib/traffic";
import { slugForCity } from "@/lib/catalog";
import { orderNumber } from "@/lib/order-number";

// The Stripe webhook for orders (register this URL in Stripe for checkout.session.completed).

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Firestore / gRPC status for create() on a document that already exists
const ALREADY_EXISTS = 6;
// The Stripe sync can save an order before this webhook does (a late or retried delivery). Such an
// order still gets its confirmation email, but only while the checkout is this recent.
const LATE_CONFIRMATION_DAYS = 3;

const ok = () => new Response(JSON.stringify({ received: true }), { status: 200 });

export async function POST(req: Request) {
    const rawBody = await req.text();
    const sig = (await headers()).get("stripe-signature");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
        return new Response("Missing signature or secret", { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type !== "checkout.session.completed") return ok();

    const session = event.data.object as Stripe.Checkout.Session;
    const ordersRef = adminDb.collection("orders");
    const orderRef = ordersRef.doc(session.id);

    // Stripe retries deliveries and can send the same event twice: an order that is already
    // saved is left as it is and gets no second confirmation email. Older orders are stored
    // under a random document id with the session in stripe_id.
    try {
        if ((await orderRef.get()).exists) return await confirmImportedOrder(session, orderRef);
        if (!(await ordersRef.where("stripe_id", "==", session.id).limit(1).get()).empty) return ok();
    } catch (e) {
        console.error("Could not check for an existing order", session.id, e);
        return new Response("Order lookup failed", { status: 500 });
    }

    let detailedSession: Stripe.Checkout.Session;
    try {
        // Retrieve session with expanded line items for the stored order and the email
        detailedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["line_items.data.price.product"],
        });
    } catch (e) {
        console.error("Could not retrieve the checkout session", session.id, e);
        return new Response("Session lookup failed", { status: 500 });
    }

    const customerEmail = session.customer_details?.email || "";
    const lineItems = detailedSession.line_items?.data || [];
    // Customer's language (sessions from before localization: Turkish)
    const locale = sessionLocale(detailedSession);
    const now = new Date().toISOString();

    const orderData = {
        stripe_id: session.id,
        order_number: orderNumber(session.id),
        amount_total: session.amount_total || 0,
        customer_email: customerEmail,
        payment_status: session.payment_status || "paid",
        status: session.status || "complete",
        created: session.created || Math.floor(Date.now() / 1000),
        shipping_details: detailedSession.collected_information?.shipping_details || detailedSession.customer_details?.address || null,
        // Turkish product names for the admin dashboard, product ids as before
        line_items: lineItemsForStorage(lineItems),
        locale,
        payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
        customer_name: detailedSession.customer_details?.name || "",
        customer_phone: detailedSession.customer_details?.phone || "",
        amount_shipping: detailedSession.total_details?.amount_shipping ?? null,
        amount_discount: detailedSession.total_details?.amount_discount ?? null,
        currency: detailedSession.currency || "eur",
        refunded_amount: 0,
        stripe_refunds: [],
        shipped: false,
        custom_flag: "",
        notes: "",
        deleted: false,
        created_at: now,
        updated_at: now,
    };

    // create() fails when the document exists, so two deliveries arriving at the same time
    // still save (and email) the order once. Any other failure returns 500 so Stripe retries.
    try {
        await orderRef.create(orderData);
    } catch (e: any) {
        // Saved in the meantime (a parallel delivery, or the Stripe sync)
        if (e?.code === ALREADY_EXISTS) {
            return await confirmImportedOrder(session, orderRef).catch((err) => {
                console.error("Could not check the existing order", session.id, err);
                return new Response("Order lookup failed", { status: 500 });
            });
        }
        console.error("Error storing order in Firebase:", session.id, e);
        return new Response("Could not store the order", { status: 500 });
    }

    await recordPurchase(session, lineItems);
    // Confirmation email, sent once: by the delivery that created the order
    if (customerEmail) await sendConfirmation(detailedSession, orderRef, customerEmail, locale);
    return ok();
}

// An order the Stripe sync imported before this webhook arrived has had no confirmation email.
// Send it once (a transaction claims it, so parallel deliveries cannot both send), when the
// checkout is recent. Anything else that already exists is left as it is.
async function confirmImportedOrder(session: Stripe.Checkout.Session, orderRef: FirebaseFirestore.DocumentReference) {
    const recent = Date.now() / 1000 - (session.created || 0) < LATE_CONFIRMATION_DAYS * 86400;
    if (!recent) return ok();
    const claimed = await adminDb.runTransaction(async (tx) => {
        const o = (await tx.get(orderRef)).data();
        if (!o || !o.imported_from_stripe || o.deleted || o.confirmation_email_sent_at || o.confirmation_email_claimed_at) return null;
        tx.update(orderRef, { confirmation_email_claimed_at: new Date().toISOString() });
        return o;
    });
    if (!claimed) return ok();

    let detailedSession: Stripe.Checkout.Session;
    try {
        detailedSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items.data.price.product"] });
    } catch (e) {
        // Release the claim so Stripe's retry can send it
        console.error("Could not retrieve the checkout session", session.id, e);
        await orderRef.update({ confirmation_email_claimed_at: FieldValue.delete() }).catch(() => undefined);
        return new Response("Session lookup failed", { status: 500 });
    }
    // The purchase was not counted either: the webhook never got past saving the order
    await recordPurchase(session, detailedSession.line_items?.data || []);
    // An address the admin corrected on the imported order wins over the checkout's
    const to = String(claimed.customer_email || session.customer_details?.email || "");
    if (to) await sendConfirmation(detailedSession, orderRef, to, sessionLocale(detailedSession));
    return ok();
}

// Store analytics: count the purchase on the day and visitor that started checkout
async function recordPurchase(session: Stripe.Checkout.Session, lineItems: Stripe.LineItem[]) {
    const vh = session.metadata?.vh;
    const vd = session.metadata?.vd;
    if (!vh || !vd) return;
    await recordEvent(
        { event: "purchase", value: session.amount_total || 0, slugs: purchasedSlugs(lineItems) },
        { hash: vh, day: vd, country: "", device: "" }
    ).catch((e) => console.error("track purchase failed:", e));
}

async function sendConfirmation(
    detailedSession: Stripe.Checkout.Session,
    orderRef: FirebaseFirestore.DocumentReference,
    to: string,
    locale: ReturnType<typeof sessionLocale>
) {
    const orderTotal = (detailedSession.amount_total || 0) / 100;
    const shippingCost = (detailedSession.total_details?.amount_shipping || 0) / 100;
    try {
        const { subject, html } = buildOrderConfirmationEmail({
            locale,
            variant: "minimal",
            created: detailedSession.created,
            sessionId: detailedSession.id,
            orderTotal,
            shippingCost,
            itemsTotal: orderTotal - shippingCost,
            lineItems: detailedSession.line_items?.data || [],
            shipping: detailedSession.collected_information?.shipping_details,
        });
        await transporter.sendMail({ from: mailFrom(), replyTo: REPLY_TO, to, subject, html });
        await orderRef
            .update({ confirmation_email_sent_at: new Date().toISOString() })
            .catch((e) => console.error("Could not mark the confirmation email as sent", detailedSession.id, e));
    } catch (mailError) {
        // The order is saved; a retry would not send the email again, so record the failure instead
        console.error("Failed to send confirmation email", detailedSession.id, mailError);
        await orderRef
            .update({ confirmation_email_error: String(mailError).slice(0, 500) })
            .catch(() => undefined);
    }
}

// Product slugs of the purchased items (the checkout stores the display name in product metadata)
function purchasedSlugs(items: Stripe.LineItem[]): { slug: string; quantity: number }[] {
    return items.flatMap((li) => {
        const product = li.price?.product;
        const city = product && typeof product !== "string" && "metadata" in product ? product.metadata?.city : undefined;
        const slug = city ? slugForCity(city) : undefined;
        return slug ? [{ slug, quantity: li.quantity || 1 }] : [];
    });
}
