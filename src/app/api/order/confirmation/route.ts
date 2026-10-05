import Stripe from "stripe";
import nodemailer from "nodemailer";
import { buildOrderConfirmationEmail, sessionLocale } from "@/lib/emails/order-confirmation";
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

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return Response.json({ error: "Session ID required" }, { status: 400 });
        }

        // Retrieve session from Stripe with expanded line items
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items']
        });

        if (!session.customer_email) {
            return Response.json({ error: "No customer email found" }, { status: 400 });
        }

        // Format order details
        const orderTotal = (session.amount_total || 0) / 100;
        const shippingCost = (session.total_details?.amount_shipping || 0) / 100;
        const itemsTotal = orderTotal - shippingCost;

        // Get line items for product details
        const lineItems = session.line_items?.data || [];

        // Customer's language (sessions from before localization: Turkish)
        const { subject, html: emailHtml } = buildOrderConfirmationEmail({
            locale: sessionLocale(session),
            variant: "classic-emoji",
            created: session.created,
            orderTotal,
            shippingCost,
            itemsTotal,
            lineItems,
            shipping: (session as any).shipping_details,
        });

        // Send email
        await transporter.sendMail({
            from: mailFrom(),
            replyTo: REPLY_TO,
            to: session.customer_email,
            subject,
            html: emailHtml,
        });

        return Response.json({ success: true, message: "Confirmation email sent" });

    } catch (error) {
        console.error("Error sending confirmation email:", error);
        return Response.json(
            { error: "Failed to send confirmation email" },
            { status: 500 }
        );
    }
}
