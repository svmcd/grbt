// Sender for every customer email: brand name as display name, replies go to info@
export const BRAND_NAME = process.env.SMTP_FROM_NAME || "eğrikuyu";
export const REPLY_TO = "info@egrikuyu.com";

export function mailFrom(): string {
    const address = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    return `"${BRAND_NAME}" <${address}>`;
}
