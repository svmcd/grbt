import Stripe from "stripe";
import { headers } from "next/headers";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            // Send confirmation email
            if (session.customer_email) {
                const orderTotal = (session.amount_total || 0) / 100;
                const shippingCost = (session.total_details?.amount_shipping || 0) / 100;
                const itemsTotal = orderTotal - shippingCost;

                // Get line items for product details - need to expand them
                const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items']
                });
                const lineItems = expandedSession.line_items?.data || [];

                const emailHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Sipariş Onayı - GRBT</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                            .content { background: #f9f9f9; padding: 20px; }
                            .order-details { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; }
                            .shipping-details { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; }
                            .footer { background: #000; color: #fff; padding: 20px; text-align: center; font-size: 12px; }
                            .total { font-weight: bold; font-size: 18px; }
                            .product-item { padding: 10px; margin: 10px 0; background: #f8f8f8; border-left: 3px solid #000; }
                            .product-name { font-weight: bold; font-size: 16px; }
                            .product-details { color: #666; font-size: 14px; margin: 5px 0; }
                            .product-price { color: #000; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>GRBT</h1>
                                <h2>Sipariş Onayı</h2>
                            </div>
                            
                            <div class="content">
                                <p>Merhaba,</p>
                                <p>Siparişiniz başarıyla alındı ve işleme konuldu. Teşekkür ederiz!</p>
                                
                                <div class="order-details">
                                    <h3>Sipariş Detayları</h3>
                                    <p><strong>Sipariş ID:</strong> ${session.id}</p>
                                    <p><strong>Sipariş Tarihi:</strong> ${new Date(session.created * 1000).toLocaleDateString('tr-TR')}</p>
                                    <p><strong>Durum:</strong> Ödendi</p>
                                </div>

                                <div class="order-details">
                                    <h3>Sipariş Edilen Ürünler</h3>
                                    ${lineItems.map(item => {
                    const desc = item.description || '';
                    const colorMatch = desc.match(/(beyaz|siyah|mavi|kırmızı|yeşil|sarı|mor|pembe|turuncu|gri)/i);
                    const sizeMatch = desc.match(/(S|M|L|XL|XXL)/);
                    const personalizationMatch = desc.match(/• (Baskı|İşleme) • "([^"]+)" • ([^•]+) • Font: ([^•]+) • Renk: ([^•]+)/);
                    const giftPackageMatch = desc.match(/• Hediye Paketi(?: • Mesaj: "([^"]+)")?/);
                    const productName = (item as any).price_data?.product_data?.name || 'Ürün';
                    const quantity = item.quantity || 1;
                    const unitPrice = ((item as any).price_data?.unit_amount || (item as any).amount || 0) / 100;

                    return `
                                            <div class="product-item">
                                                <div class="product-name">${productName}</div>
                                                <div class="product-details">
                                                    ${colorMatch ? `<strong>Renk:</strong> ${colorMatch[1].toUpperCase()}` : ''}
                                                    ${sizeMatch ? ` • <strong>Beden:</strong> ${sizeMatch[1]}` : ''}
                                                </div>
                                                ${personalizationMatch ? `
                                                <div class="product-details">
                                                    <strong>Kişiselleştirme:</strong> ${personalizationMatch[1]} • "${personalizationMatch[2]}" • ${personalizationMatch[3]} • Font: ${personalizationMatch[4]} • Renk: ${personalizationMatch[5]}
                                                </div>
                                                ` : ''}
                                                ${giftPackageMatch ? `
                                                <div class="product-details">
                                                    <strong>Hediye Paketi:</strong> Dahil${giftPackageMatch[1] ? ` • Mesaj: "${giftPackageMatch[1]}"` : ''}
                                                </div>
                                                ` : ''}
                                                <div class="product-details">
                                                    <strong>Adet:</strong> ${quantity} • <strong>Birim Fiyat:</strong> €${unitPrice.toFixed(2)}
                                                </div>
                                                <div class="product-price">Toplam: €${(unitPrice * quantity).toFixed(2)}</div>
                                            </div>
                                        `;
                }).join('')}
                                </div>

                                <div class="shipping-details">
                                    <h3>Teslimat Bilgileri</h3>
                                    ${(session as any).shipping_details ? `
                                        <p><strong>Ad Soyad:</strong> ${(session as any).shipping_details.name}</p>
                                        <p><strong>Adres:</strong> ${(session as any).shipping_details.address?.line1 || ''}</p>
                                        ${(session as any).shipping_details.address?.line2 ? `<p><strong>Adres 2:</strong> ${(session as any).shipping_details.address.line2}</p>` : ''}
                                        <p><strong>Şehir:</strong> ${(session as any).shipping_details.address?.city || ''}</p>
                                        <p><strong>Posta Kodu:</strong> ${(session as any).shipping_details.address?.postal_code || ''}</p>
                                        <p><strong>Ülke:</strong> ${(session as any).shipping_details.address?.country || ''}</p>
                                    ` : '<p>Teslimat bilgileri bulunamadı.</p>'}
                                </div>

                                <div class="order-details">
                                    <h3>Ödeme Bilgileri</h3>
                                    <p><strong>Ürünler Toplamı:</strong> €${itemsTotal.toFixed(2)}</p>
                                    <p><strong>Kargo:</strong> €${shippingCost.toFixed(2)}</p>
                                    <p class="total"><strong>Toplam:</strong> €${orderTotal.toFixed(2)}</p>
                                </div>

                                <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-left: 4px solid #0066cc;">
                                    <h3>Önemli Bilgiler</h3>
                                    <p><strong>Ön Sipariş:</strong> Siparişiniz ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')} tarihinde kargoya verilecektir.</p>
                                    <p><strong>Takip:</strong> Kargo bilgileriniz e-posta ile gönderilecektir.</p>
                                    <p><strong>Sorularınız:</strong> info@grbt.studio adresinden bizimle iletişime geçebilirsiniz.</p>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <p>GRBT - Memleketinizi Tişörtlerde Taşıyın</p>
                                <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: session.customer_email,
                    subject: `Sipariş Onayı - ${session.id}`,
                    html: emailHtml,
                });

                console.log(`Confirmation email sent to ${session.customer_email}`);
            }
        } catch (error) {
            console.error("Error sending confirmation email:", error);
        }
    }

    return Response.json({ received: true });
}
