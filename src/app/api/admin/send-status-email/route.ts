import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { isLocale, type Locale } from "@/i18n/config";
import emails from "@/i18n/messages/emails";
import { mailFrom, REPLY_TO } from "@/lib/emails/sender";

async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

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

// Order language: the Firestore order first, then the Stripe session metadata, else Turkish
// (every order placed before localization came from the Turkish site).
async function orderLocale(orderId: string): Promise<Locale> {
    try {
        const doc = await adminDb.collection("orders").doc(orderId).get();
        const saved = doc.exists ? doc.data()?.locale : undefined;
        if (isLocale(saved)) return saved;
    } catch (error) {
        console.error("Could not read order locale from Firestore:", error);
    }
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

export async function POST(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId, status, email, trackingProvider, trackingCode, postalCode, country } = await request.json();

        if (!orderId || !status || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Customer's language, saved on the order (orders from before localization: Turkish)
        const locale = await orderLocale(orderId);
        const s = emails[locale].status;
        const layout = emails[locale].layout;

        let subject = "";
        let html = "";

        if (status === "label_created") {
            subject = s.packing.subject;
            html = `
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
            `;
        } else if (status === "shipped_out") {
            const trackingLink = trackingProvider === "DHL"
                ? `https://www.dhl.com/content/gb/en/express/tracking.html?AWB=${trackingCode}`
                : `https://jouw.postnl.nl/track-and-trace/${trackingCode}-${country || "NL"}-${postalCode || ""}`;

            subject = s.shipped.subject;
            html = `
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
                                        ${trackingProvider}
                                    </div>
                                    <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                                        ${s.shipped.trackingNumber}
                                    </div>
                                    <div class="tracking-code">
                                        ${trackingCode}
                                    </div>
                                    <div style="text-align: center; margin-top: 20px;">
                                        <a href="${trackingLink}" class="tracking-button" style="display: inline-block; padding: 12px 30px; background: #000000; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
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
            `;
        } else {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await transporter.sendMail({
            from: mailFrom(),
            replyTo: REPLY_TO,
            to: email,
            subject,
            html,
        });

        return NextResponse.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending status email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}

