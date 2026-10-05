import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isLocale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import emails from "@/i18n/messages/emails";
import { mailFrom, REPLY_TO } from "@/lib/emails/sender";

export async function POST(request: NextRequest) {
    try {
        const { name, email, message, locale: requestedLocale } = await request.json();
        // Visitor's language for the auto-reply (the notification to the shop stays Turkish)
        const locale = isLocale(requestedLocale) ? requestedLocale : await getLocale();
        const reply = emails[locale].contact;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required" },
                { status: 400 }
            );
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email to you (admin)
        const adminEmail = {
            from: mailFrom(),
            // Straight to the inbox: Gmail hides mail that forwards back to the sending account
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Yeni İletişim Mesajı - ${name}`,
            html: `
        <h2>Yeni İletişim Mesajı</h2>
        <p><strong>Ad Soyad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>Bu mesaj eğrikuyu web sitesi iletişim formundan gönderilmiştir.</em></p>
      `,
        };

        // Confirmation email to user
        const userEmail = {
            from: mailFrom(),
            replyTo: REPLY_TO,
            to: email,
            subject: reply.subject,
            html: `
        <h2>${reply.greeting(name)}</h2>
        <p>${reply.received}</p>
        
        <h3>${reply.yourMessage}</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>${reply.team}</em></p>
        <p><em>${emails[locale].layout.autoSent}</em></p>
      `,
        };

        // Send both emails
        await transporter.sendMail(adminEmail);
        await transporter.sendMail(userEmail);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
