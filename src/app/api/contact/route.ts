import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
    try {
        const { name, email, message } = await request.json();

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
            from: `GRBT <${process.env.EMAIL_USER}>`,
            to: "studio.grbt@gmail.com", // Your email address
            subject: `Yeni İletişim Mesajı - ${name}`,
            html: `
        <h2>Yeni İletişim Mesajı</h2>
        <p><strong>Ad Soyad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>Bu mesaj GRBT web sitesi iletişim formundan gönderilmiştir.</em></p>
      `,
        };

        // Confirmation email to user
        const userEmail = {
            from: `GRBT <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Mesajınız Alındı - GRBT",
            html: `
        <h2>Merhaba ${name},</h2>
        <p>Mesajınızı aldık ve en kısa sürede size dönüş yapacağız.</p>
        
        <h3>Mesajınız:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>GRBT Ekibi</em></p>
        <p><em>Bu e-posta otomatik olarak gönderilmiştir.</em></p>
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
