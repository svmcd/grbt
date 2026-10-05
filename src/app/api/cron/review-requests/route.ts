import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeOrder } from "@/lib/admin/orders";
import { REVIEW_REQUEST_AFTER_DAYS, displayName, newToken } from "@/lib/reviews";
import { mailFrom, REPLY_TO } from "@/lib/emails/sender";
import { resolveLocale } from "@/i18n/config";
import reviewMessages from "@/i18n/messages/reviews";

// Daily (vercel.json cron): asks customers for a review 10 days after their order was marked shipped.
// Only orders shipped through the admin (shipped_at) qualify; refunded orders are skipped.

export const maxDuration = 60;
const MAX_PER_RUN = 25;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function emailHtml(e: (typeof reviewMessages)["en"]["email"], name: string, link: string) {
    return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1c1c">
<div style="max-width:560px;margin:0 auto;background:#fff;padding:40px 32px">
  <div style="font-size:22px;letter-spacing:.02em;margin-bottom:32px">eğrikuyu</div>
  <p style="font-size:16px;margin:0 0 16px">${esc(e.greeting(name))}</p>
  <p style="font-size:15px;line-height:1.6;margin:0 0 28px">${esc(e.text)}</p>
  <a href="${esc(link)}" style="display:inline-block;background:#1c1c1c;color:#fff;text-decoration:none;padding:14px 28px;font-size:13px;letter-spacing:.06em;text-transform:uppercase">${esc(e.button)}</a>
  <p style="font-size:13px;line-height:1.6;color:#555;margin:32px 0 0">${esc(e.note)}</p>
</div></body></html>`;
}

export async function GET(request: NextRequest) {
    if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cutoff = new Date(Date.now() - REVIEW_REQUEST_AFTER_DAYS * 86400000).toISOString();
    const snap = await adminDb.collection("orders").where("shipped_at", "<=", cutoff).get();

    let sent = 0;
    const skipped: string[] = [];
    for (const doc of snap.docs) {
        if (sent >= MAX_PER_RUN) break;
        const d = doc.data();
        if (d.deleted || d.review_requested_at || d.archived) continue;
        const o = normalizeOrder(doc.id, d);
        if (!o.customer.email || o.payment.status !== "paid") {
            skipped.push(o.number);
            continue;
        }
        const locale = resolveLocale(o.locale);
        const e = reviewMessages[locale].email;
        const token = d.review_token || newToken();
        const link = `https://egrikuyu.com/review/${token}?lang=${locale}`;
        try {
            await transporter.sendMail({
                from: mailFrom(),
                replyTo: REPLY_TO,
                to: o.customer.email,
                subject: e.subject,
                html: emailHtml(e, displayName(o.customer.name || o.shipping.name).split(" ")[0], link),
            });
            await doc.ref.update({ review_token: token, review_requested_at: new Date().toISOString() });
            sent++;
        } catch (error) {
            console.error(`Review request for ${o.number} failed:`, error);
        }
    }
    return NextResponse.json({ checked: snap.size, sent, skipped });
}
