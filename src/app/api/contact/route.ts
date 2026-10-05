import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { mailFrom } from "@/lib/emails/sender";
import { clientIp } from "@/lib/traffic";

// Contact form → one email to the shop inbox (Reply-To is the visitor).
// No auto-reply to the entered address: that would let anyone send shop-branded mail to
// any address. The form itself confirms that the message was sent.

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 3000;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

// Light per-IP limit (per server instance): 3 messages per 10 minutes
const WINDOW_MS = 10 * 60_000;
const MAX_MESSAGES = 3;
const sent = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
    const now = Date.now();
    if (sent.size > 5000) for (const [k, v] of sent) if (v.resetAt <= now) sent.delete(k);
    const entry = sent.get(ip);
    if (!entry || entry.resetAt <= now) {
        sent.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    entry.count++;
    return entry.count > MAX_MESSAGES;
}

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });

        // Honeypot: a hidden field people never fill in. Bots get a normal-looking success.
        if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ success: true });

        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const message = typeof body.message === "string" ? body.message.trim() : "";

        if (!name || !email || !message) return NextResponse.json({ error: "missing" }, { status: 400 });
        if (name.length > MAX_NAME || message.length > MAX_MESSAGE) return NextResponse.json({ error: "too_long" }, { status: 400 });
        if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

        if (rateLimited(clientIp(request.headers) || "unknown")) {
            return NextResponse.json({ error: "rate_limited" }, { status: 429 });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Single line for the subject: no line breaks from the name
        const subjectName = name.replace(/[\r\n]+/g, " ");

        await transporter.sendMail({
            from: mailFrom(),
            // Straight to the inbox: Gmail hides mail that forwards back to the sending account
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Yeni İletişim Mesajı - ${subjectName}`,
            html: `
        <h2>Yeni İletişim Mesajı</h2>
        <p><strong>Ad Soyad:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${escapeHtml(message).replace(/\r?\n/g, "<br>")}</p>

        <hr>
        <p><em>Bu mesaj eğrikuyu web sitesi iletişim formundan gönderilmiştir.</em></p>
      `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json({ error: "failed" }, { status: 500 });
    }
}
