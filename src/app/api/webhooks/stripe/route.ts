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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Email configurationn
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(request: Request) {
    console.log("🔔 WEBHOOK CALLED - Starting webhook processing...");

    const body = await request.text();
    const signature = (await headers()).get("stripe-signature")!;

    console.log("📝 Webhook body length:", body.length);
    console.log("🔐 Webhook signature present:", !!signature);

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("✅ Webhook signature verified successfully");
        console.log("📋 Event type:", event.type);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err);
        return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💳 CHECKOUT SESSION COMPLETED - Processing order:", session.id);
        console.log("📧 Customer email:", session.customer_email);
        console.log("💰 Amount total:", session.amount_total);

        try {
            // Send confirmation email
            if (session.customer_email) {
                const orderTotal = (session.amount_total || 0) / 100;
                const shippingCost = (session.total_details?.amount_shipping || 0) / 100;
                const itemsTotal = orderTotal - shippingCost;

                // Get line items for product details - need to expand them
                const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items.data.price.product']
                });
                const lineItems = expandedSession.line_items?.data || [];

                // Customer's language (sessions from before localization: Turkish)
                const locale = sessionLocale(session);
                const { subject, html: emailHtml } = buildOrderConfirmationEmail({
                    locale,
                    variant: "classic",
                    created: session.created,
                    orderTotal,
                    shippingCost,
                    itemsTotal,
                    lineItems,
                    shipping: (session as any).shipping_details,
                });

                await transporter.sendMail({
                    from: mailFrom(),
                    replyTo: REPLY_TO,
                    to: session.customer_email,
                    subject,
                    html: emailHtml,
                });

                console.log(`Confirmation email sent to ${session.customer_email}`);

                // Store order in Firebase using Admin SDK
                console.log("🔥 FIREBASE STORAGE - Starting Firebase write...");
                try {
                    console.log("🔧 Firebase Admin SDK - Checking environment variables...");
                    console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✅ SET" : "❌ MISSING");
                    console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "✅ SET" : "❌ MISSING");
                    console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "✅ SET" : "❌ MISSING");

                    const orderData = {
                        stripe_id: session.id,
                        amount_total: session.amount_total || 0,
                        customer_email: session.customer_email || "",
                        payment_status: session.payment_status || "paid",
                        status: session.status || "complete",
                        created: session.created || Math.floor(Date.now() / 1000),
                        shipping_details: (session as any).shipping_details || null,
                        // Turkish product names for the admin dashboard, product ids as before
                        line_items: lineItemsForStorage(expandedSession.line_items?.data || []),
                        locale,
                        shipped: false,
                        custom_flag: "",
                        notes: "",
                        deleted: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    console.log("📝 Order data prepared:", JSON.stringify(orderData, null, 2));

                    const orderRef = adminDb.collection('orders').doc(session.id);
                    console.log("🔥 Attempting Firebase write to collection 'orders', document:", session.id);

                    await orderRef.set(orderData);
                    console.log(`✅ SUCCESS: Order ${session.id} stored in Firebase`);
                } catch (firebaseError) {
                    console.error("❌ FIREBASE ERROR:", firebaseError);
                    console.error("❌ Error details:", JSON.stringify(firebaseError, null, 2));
                }
            }
        } catch (error) {
            console.error("❌ GENERAL ERROR in webhook processing:", error);
        }
    } else {
        console.log("ℹ️ Event type not handled:", event.type);
    }

    console.log("🏁 WEBHOOK PROCESSING COMPLETE");
    return Response.json({ received: true });
}
