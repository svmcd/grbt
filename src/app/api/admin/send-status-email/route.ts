import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { isLocale, type Locale } from "@/i18n/config";
import emails from "@/i18n/messages/emails";
import { mailFrom, REPLY_TO } from "@/lib/emails/sender";
import { buildOrderConfirmationEmail } from "@/lib/emails/order-confirmation";
import { requireAdmin } from "@/lib/admin/auth";
import { normalizeOrder, trackingUrl, type AdminEmailLog, type AdminEmailType, type AdminOrder } from "@/lib/admin/orders";

// Customer emails sent from the admin: packing (label created), shipped with tracking, and a resend
// of the order confirmation. Every email that goes out is recorded on the order (`emails`).

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
    : null;

const TYPES: AdminEmailType[] = ["label_created", "shipped_out", "order_confirmation"];

const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Order language: the Firestore order first, then the Stripe session metadata, else Turkish
// (every order placed before localization came from the Turkish site).
async function orderLocale(orderId: string, saved: unknown): Promise<Locale> {
    if (isLocale(saved)) return saved;
    if (stripe && orderId.startsWith("cs_")) {
        try {
            const session = await stripe.checkout.sessions.retrieve(orderId);
            if (isLocale(session.metadata?.locale)) return session.metadata.locale;
        } catch (error) {
            console.error("Could not read order locale from Stripe:", error);
        }
    }
    return "tr";
}

function packingEmail(locale: Locale) {
    const s = emails[locale].status;
    const layout = emails[locale].layout;
    return {
        subject: s.packing.subject,
        html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${s.packing.subject}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                            line-height: 1.6; 
                            color: #1a1a1a; 
                            background-color: #f8f9fa;
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        }
                        .header { 
                            background: #000000; 
                            color: #ffffff; 
                            padding: 40px 30px; 
                            text-align: center;
                        }
                        .logo { 
                            font-size: 32px; 
                            font-weight: 400; 
                            letter-spacing: -1px;
                            margin-bottom: 8px;
                            font-family: 'Times New Roman', serif;
                        }
                        .header-subtitle { 
                            font-size: 16px; 
                            opacity: 0.8; 
                            font-weight: 400;
                        }
                        .content { 
                            padding: 40px 30px; 
                        }
                        .order-status {
                            background: #000000;
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            text-align: center;
                            margin-bottom: 30px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        }
                        .status-text {
                            font-size: 16px;
                            font-weight: 600;
                        }
                        .section { 
                            background: #ffffff; 
                            padding: 25px; 
                            margin: 25px 0; 
                            border-radius: 12px;
                            border: 1px solid #e9ecef;
                        }
                        .footer { 
                            background: #000000; 
                            color: #ffffff; 
                            padding: 30px; 
                            text-align: center; 
                            font-size: 13px;
                        }
                        .footer-brand {
                            font-size: 18px;
                            font-weight: 400;
                            margin-bottom: 10px;
                            font-family: 'Times New Roman', serif;
                        }
                        .footer-tagline {
                            opacity: 0.8;
                            margin-bottom: 15px;
                        }
                        .footer-contact {
                            opacity: 0.7;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <div class="logo">eğrikuyu</div>
                            <div class="header-subtitle">${layout.tagline}</div>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 18px; margin-bottom: 20px; color: #2c3e50;">
                                ${s.greeting}
                            </p>
                            
                            <div class="order-status">
                                <div class="status-text">${s.packing.status}</div>
                            </div>
                            
                            <div class="section">
                                <p style="font-size: 16px; color: #2c3e50; margin-bottom: 15px; font-weight: 500;">
                                    ${s.packing.lead}
                                </p>
                                <p style="font-size: 14px; color: #6c757d; line-height: 1.6; margin-bottom: 10px;">
                                    ${s.packing.body}
                                </p>
                                <p style="font-size: 14px; color: #6c757d; line-height: 1.6;">
                                    ${s.packing.thanks}
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="footer-brand">eğrikuyu</div>
                            <div class="footer-tagline">${layout.tagline}</div>
                            <div class="footer-contact">
                                ${layout.autoSent}<br>
                                ${layout.copyright}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
    };
}

function shippedEmail(locale: Locale, trackingProvider: string, trackingCode: string, trackingLink: string) {
    const s = emails[locale].status;
    const layout = emails[locale].layout;
    return {
        subject: s.shipped.subject,
        html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${s.shipped.subject}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                            line-height: 1.6; 
                            color: #1a1a1a; 
                            background-color: #f8f9fa;
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        }
                        .header { 
                            background: #000000; 
                            color: #ffffff; 
                            padding: 40px 30px; 
                            text-align: center;
                        }
                        .logo { 
                            font-size: 32px; 
                            font-weight: 700; 
                            letter-spacing: -1px;
                            margin-bottom: 8px;
                            font-family: 'Times New Roman', serif;
                        }
                        .header-subtitle { 
                            font-size: 16px; 
                            opacity: 0.8; 
                            font-weight: 400;
                        }
                        .content { 
                            padding: 40px 30px; 
                        }
                        .order-status {
                            background: #000000;
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            text-align: center;
                            margin-bottom: 30px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        }
                        .status-text {
                            font-size: 16px;
                            font-weight: 600;
                        }
                        .section { 
                            background: #ffffff; 
                            padding: 25px; 
                            margin: 25px 0; 
                            border-radius: 12px;
                            border: 1px solid #e9ecef;
                        }
                        .tracking-info {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid #000000;
                        }
                        .tracking-code {
                            font-size: 24px;
                            font-weight: 700;
                            color: #2c3e50;
                            margin: 10px 0;
                            font-family: 'Courier New', monospace;
                            letter-spacing: 2px;
                        }
                        .tracking-button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: #000000;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 600;
                            margin-top: 15px;
                            transition: background 0.3s;
                        }
                        .tracking-button:hover {
                            background: #333333;
                        }
                        .footer { 
                            background: #000000; 
                            color: #ffffff; 
                            padding: 30px; 
                            text-align: center; 
                            font-size: 13px;
                        }
                        .footer-brand {
                            font-size: 18px;
                            font-weight: 700;
                            margin-bottom: 10px;
                            font-family: 'Times New Roman', serif;
                        }
                        .footer-tagline {
                            opacity: 0.8;
                            margin-bottom: 15px;
                        }
                        .footer-contact {
                            opacity: 0.7;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <div class="logo">eğrikuyu</div>
                            <div class="header-subtitle">${layout.tagline}</div>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 18px; margin-bottom: 20px; color: #2c3e50;">
                                ${s.greeting}
                            </p>
                            
                            <div class="order-status">
                                <div class="status-text">${s.shipped.status}</div>
                            </div>
                            
                            <div class="section">
                                <p style="font-size: 16px; color: #2c3e50; margin-bottom: 15px; font-weight: 500;">
                                    ${s.shipped.lead}
                                </p>
                                <p style="font-size: 14px; color: #6c757d; line-height: 1.6; margin-bottom: 20px;">
                                    ${s.shipped.body}
                                </p>
                                
                                <div class="tracking-info">
                                    <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                                        ${s.shipped.carrier}
                                    </div>
                                    <div style="font-size: 18px; color: #2c3e50; font-weight: 600; margin-bottom: 15px;">
                                        ${esc(trackingProvider)}
                                    </div>
                                    <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                                        ${s.shipped.trackingNumber}
                                    </div>
                                    <div class="tracking-code">
                                        ${esc(trackingCode)}
                                    </div>
                                    <div style="text-align: center; margin-top: 20px;">
                                        <a href="${esc(trackingLink)}" class="tracking-button" style="display: inline-block; padding: 12px 30px; background: #000000; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                                            ${s.shipped.button}
                                        </a>
                                    </div>
                                </div>
                                
                                <p style="font-size: 14px; color: #6c757d; line-height: 1.6; margin-top: 20px;">
                                    ${s.shipped.closing}
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="footer-brand">eğrikuyu</div>
                            <div class="footer-tagline">${layout.tagline}</div>
                            <div class="footer-contact">
                                ${layout.autoSent}<br>
                                ${layout.copyright}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
    };
}

// The checkout confirmation, built by the same module and design ("minimal") the Stripe webhook
// (/api/checkout-session-completed) uses. The address is the one saved on the order, so a resend
// after an address correction shows the corrected address.
async function confirmationEmail(order: AdminOrder, raw: any, locale: Locale) {
    const shipping = {
        name: order.shipping.name || order.customer.name,
        address: {
            line1: order.shipping.line1 || null,
            line2: order.shipping.line2 || null,
            city: order.shipping.city || null,
            postal_code: order.shipping.postalCode || null,
            country: order.shipping.country || null,
            state: null,
        },
    };
    let lineItems: Stripe.LineItem[];
    let orderTotal = order.amountTotal / 100;
    let shippingCost = (order.amountShipping || 0) / 100;
    if (stripe && order.id.startsWith("cs_")) {
        // As the webhook does: the session's own line items and totals
        const session = await stripe.checkout.sessions.retrieve(order.id, { expand: ["line_items.data.price.product"] });
        lineItems = session.line_items?.data || [];
        orderTotal = (session.amount_total || 0) / 100;
        shippingCost = (session.total_details?.amount_shipping || 0) / 100;
    } else {
        // Manual orders: the stored items, with the name and unit price where the template reads them
        lineItems = (raw.line_items || []).map((li: any) => ({
            ...li,
            price_data: { product_data: { name: li.description }, unit_amount: li.price?.unit_amount ?? li.amount_total ?? 0 },
        }));
    }
    return buildOrderConfirmationEmail({
        locale,
        variant: "minimal",
        created: order.created,
        sessionId: raw.stripe_id || order.id,
        orderTotal,
        shippingCost,
        itemsTotal: orderTotal - shippingCost,
        lineItems,
        shipping,
    });
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    try {
        const body = await request.json();
        const { orderId, status, resend } = body as { orderId?: string; status?: string; resend?: boolean };
        if (!orderId || !status) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        if (!TYPES.includes(status as AdminEmailType)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        const type = status as AdminEmailType;

        // Everything comes from the saved order, so the link is the one the admin shows
        const ref = adminDb.collection("orders").doc(orderId);
        const snap = await ref.get();
        const raw = snap.data();
        if (!snap.exists || !raw || raw.deleted) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        const order = normalizeOrder(snap.id, raw);
        const to = order.customer.email;
        if (!to) return NextResponse.json({ error: "This order has no customer email" }, { status: 400 });
        // A packing or tracking email for an order the customer got all their money back for would
        // only confuse them (bulk runs leave these orders out; this also covers a stale screen)
        if (type !== "order_confirmation" && order.payment.status === "refunded") {
            return NextResponse.json({ error: "Not sent: this order is fully refunded", skipped: "refunded" }, { status: 409 });
        }

        // Customer's language, saved on the order (orders from before localization: Turkish)
        const locale = await orderLocale(orderId, raw.locale);

        let mail: { subject: string; html: string };
        if (type === "label_created") {
            mail = packingEmail(locale);
        } else if (type === "shipped_out") {
            const f = order.fulfillment;
            const link = trackingUrl(f.trackingProvider, f.trackingCode, order.shipping.country || "NL", order.shipping.postalCode);
            if (!f.trackingProvider || !f.trackingCode || !link) return NextResponse.json({ error: "Save a tracking code first" }, { status: 400 });
            mail = shippedEmail(locale, f.trackingProvider, f.trackingCode, link);
        } else {
            mail = await confirmationEmail(order, raw, locale);
        }

        await transporter.sendMail({ from: mailFrom(), replyTo: REPLY_TO, to, subject: mail.subject, html: mail.html });

        const log: AdminEmailLog = { type, to, at: new Date().toISOString(), by: admin.email, ...(resend ? { resend: true } : {}) };
        let saved = true;
        try {
            await ref.update({ emails: FieldValue.arrayUnion(log), updated_at: log.at });
        } catch (error) {
            saved = false;
            console.error("Email sent but not recorded on the order:", error);
        }
        const after = saved ? normalizeOrder(snap.id, (await ref.get()).data()) : { ...order, emails: [...order.emails, log] };
        return NextResponse.json({ success: true, message: "Email sent successfully", order: after });
    } catch (error) {
        console.error("Error sending status email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
