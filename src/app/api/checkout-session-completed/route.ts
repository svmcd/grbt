import Stripe from "stripe";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebase-admin";
import { buildOrderConfirmationEmail, sessionLocale } from "@/lib/emails/order-confirmation";
import { lineItemsForStorage } from "@/lib/emails/line-items";
import { mailFrom, REPLY_TO } from "@/lib/emails/sender";

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

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        try {
            const customerEmail = (session.customer_details && session.customer_details.email) || "";
            if (customerEmail) {
                // Retrieve session with expanded line items for detailed email
                const detailedSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items.data.price.product']
                });

                // Format order details
                const orderTotal = (detailedSession.amount_total || 0) / 100;
                const shippingCost = (detailedSession.total_details?.amount_shipping || 0) / 100;
                const itemsTotal = orderTotal - shippingCost;

                // Get line items for product details
                const lineItems = detailedSession.line_items?.data || [];

                // Customer's language (sessions from before localization: Turkish)
                const locale = sessionLocale(detailedSession);
                const { subject, html: emailHtml } = buildOrderConfirmationEmail({
                    locale,
                    variant: "minimal",
                    created: detailedSession.created,
                    orderTotal,
                    shippingCost,
                    itemsTotal,
                    lineItems,
                    shipping: detailedSession.collected_information?.shipping_details,
                });

                // Send detailed email
                await transporter.sendMail({
                    from: mailFrom(),
                    replyTo: REPLY_TO,
                    to: customerEmail,
                    subject,
                    html: emailHtml,
                });

                // Store order in Firebase using Admin SDK
                try {
                    const shippingDetails = detailedSession.collected_information?.shipping_details || detailedSession.customer_details?.address || null;

                    const orderData = {
                        stripe_id: session.id,
                        amount_total: session.amount_total || 0,
                        customer_email: customerEmail,
                        payment_status: session.payment_status || "paid",
                        status: session.status || "complete",
                        created: session.created || Math.floor(Date.now() / 1000),
                        shipping_details: shippingDetails,
                        // Turkish product names for the admin dashboard, product ids as before
                        line_items: lineItemsForStorage(lineItems),
                        locale,
                        shipped: false,
                        custom_flag: "",
                        notes: "",
                        deleted: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    const orderRef = adminDb.collection('orders').doc(session.id);
                    await orderRef.set(orderData);
                } catch (firebaseError) {
                    console.error("Error storing order in Firebase:", firebaseError);
                }
            }
        } catch (e) {
            console.error("Failed to send confirmation email", e);
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}

export const config = {
    api: {
        bodyParser: false,
    },
};


