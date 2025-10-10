import nodemailer from "nodemailer";

export function getTransport() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || "true") === "true";
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
}

export async function sendOrderConfirmationEmail(to: string, data: {
    orderId: string;
    amountTotal: number;
}) {
    const fromName = process.env.SMTP_FROM_NAME || "grbt.";
    const fromEmail = process.env.SMTP_FROM_EMAIL || "studio.grbt@gmail.com";
    const transport = getTransport();

    const subject = `Your grbt. order ${data.orderId}`;
    const html = `
    <div style="font-family:Inter,system-ui,sans-serif;line-height:1.6">
      <h2 style="margin:0 0 8px 0">Order confirmed</h2>
      <p style="margin:0 0 8px 0">Thanks for your purchase. Your order is being processed.</p>
      <p style="margin:0 0 8px 0">Order ID: <strong>${data.orderId}</strong></p>
      <p style="margin:0 0 8px 0">Total: <strong>€${(data.amountTotal / 100).toFixed(2)}</strong></p>
      <p style="margin:16px 0 0 0">You will receive shipping updates when your order is dispatched.</p>
      <p style="margin:16px 0 0 0">— grbt.</p>
    </div>
  `;

    await transport.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        html,
    });
}


