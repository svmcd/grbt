import Stripe from "stripe";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebase-admin";

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

export async function POST(req: Request) {
    const rawBody = await req.text();
    const sig = (await headers()).get("stripe-signature");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
        return new Response("Missing signature or secret", { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        try {
            const customerEmail = (session.customer_details && session.customer_details.email) || "";
            if (customerEmail) {
                // Retrieve session with expanded line items for detailed email
                const detailedSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items']
                });

                // Format order details
                const orderTotal = (detailedSession.amount_total || 0) / 100;
                const shippingCost = (detailedSession.total_details?.amount_shipping || 0) / 100;
                const itemsTotal = orderTotal - shippingCost;

                // Get line items for product details
                const lineItems = detailedSession.line_items?.data || [];

                // Create clean email content
                const emailHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Sipariş Onayı - grbt.</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                                line-height: 1.6; 
                                color: #000000; 
                                background-color: #ffffff;
                            }
                            .email-container { 
                                max-width: 600px; 
                                margin: 0 auto; 
                                background-color: #ffffff;
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
                                font-weight: 300;
                            }
                            .content { 
                                padding: 40px 30px; 
                            }
                            .greeting {
                                font-size: 18px;
                                margin-bottom: 30px;
                                color: #000000;
                                font-weight: 300;
                            }
                            .order-status {
                                background: #000000;
                                color: #ffffff;
                                padding: 20px;
                                text-align: center;
                                margin-bottom: 30px;
                            }
                            .status-text {
                                font-size: 16px;
                                font-weight: 400;
                            }
                            .section { 
                                background: #ffffff; 
                                padding: 25px 0; 
                                margin: 25px 0; 
                                border-bottom: 1px solid #e5e5e5;
                            }
                            .section-title { 
                                font-size: 18px; 
                                font-weight: 400; 
                                color: #000000; 
                                margin-bottom: 20px;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                            }
                            .order-info {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 20px;
                                margin-bottom: 20px;
                            }
                            .info-item {
                                padding: 15px 0;
                                border-bottom: 1px solid #f0f0f0;
                            }
                            .info-label {
                                font-size: 12px;
                                color: #666666;
                                text-transform: uppercase;
                                font-weight: 400;
                                letter-spacing: 1px;
                                margin-bottom: 5px;
                            }
                            .info-value {
                                font-size: 16px;
                                font-weight: 400;
                                color: #000000;
                            }
                            .product-item {
                                padding: 20px 0;
                                border-bottom: 1px solid #f0f0f0;
                            }
                            .product-name {
                                font-size: 18px;
                                font-weight: 400;
                                color: #000000;
                                margin-bottom: 10px;
                            }
                            .product-details {
                                font-size: 14px;
                                color: #666666;
                                margin: 5px 0;
                                line-height: 1.5;
                            }
                            .product-price {
                                font-size: 16px;
                                font-weight: 400;
                                color: #000000;
                                margin-top: 10px;
                                padding-top: 10px;
                                border-top: 1px solid #f0f0f0;
                            }
                            .shipping-address {
                                padding: 20px 0;
                            }
                            .address-line {
                                margin: 5px 0;
                                font-size: 14px;
                                color: #000000;
                            }
                            .total-section {
                                background: #000000;
                                color: #ffffff;
                                padding: 25px;
                                margin: 25px 0;
                            }
                            .total-row {
                                display: flex;
                                justify-content: space-between;
                                margin: 8px 0;
                                font-size: 14px;
                            }
                            .total-final {
                                font-size: 18px;
                                font-weight: 400;
                                border-top: 1px solid rgba(255, 255, 255, 0.2);
                                padding-top: 10px;
                                margin-top: 15px;
                            }
                            .important-info {
                                background: #f8f8f8;
                                padding: 25px;
                                margin: 30px 0;
                            }
                            .important-title {
                                font-size: 16px;
                                font-weight: 400;
                                margin-bottom: 15px;
                                color: #000000;
                            }
                            .important-text {
                                font-size: 14px;
                                line-height: 1.6;
                                margin: 8px 0;
                                color: #666666;
                            }
                            .footer { 
                                background: #000000; 
                                color: #ffffff; 
                                padding: 30px; 
                                text-align: center; 
                                font-size: 13px;
                                line-height: 1.6;
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
                            @media (max-width: 600px) {
                                .email-container { margin: 0; }
                                .header, .content, .footer { padding: 20px; }
                                .order-info { grid-template-columns: 1fr; }
                                .total-row { font-size: 13px; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <div class="logo">grbt.</div>
                                <div class="header-subtitle">Memleketinizi Tişörtlerde Taşıyın</div>
                            </div>
                            
                            <div class="content">
                                <div class="greeting">Merhaba,</div>
                                
                                <div class="order-status">
                                    <div class="status-text">Siparişiniz Onaylandı</div>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0; padding: 20px;">
                                    <p style="font-size: 16px; color: #000000; margin-bottom: 10px; font-weight: 300;">
                                        Siparişiniz için teşekkür ederiz.
                                    </p>
                                    <p style="font-size: 14px; color: #666666; line-height: 1.6;">
                                        Memleket gururunuzu bizimle paylaştığınız için çok mutluyuz. 
                                        Ürünlerinizi özenle hazırlayıp en kısa sürede size ulaştıracağız.
                                    </p>
                                </div>
                                
                                <div class="section">
                                    <div class="section-title">Sipariş Bilgileri</div>
                                    <div class="order-info">
                                        <div class="info-item">
                                            <div class="info-label">Sipariş Tarihi</div>
                                            <div class="info-value">${new Date(detailedSession.created * 1000).toLocaleDateString('tr-TR')}</div>
                                        </div>
                                        <div class="info-item">
                                            <div class="info-label">Toplam Tutar</div>
                                            <div class="info-value">€${orderTotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="section">
                                    <div class="section-title">Sipariş Edilen Ürünler</div>
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
                                                <strong>${personalizationMatch[1]}:</strong> "${personalizationMatch[2]}"<br>
                                                <strong>Yerleşim:</strong> ${personalizationMatch[3]}<br>
                                                <strong>Font:</strong> ${personalizationMatch[4]} • <strong>Renk:</strong> ${personalizationMatch[5]}
                                            </div>
                                            ` : ''}
                                            ${giftPackageMatch ? `
                                            <div class="product-details">
                                                <strong>Hediye Paketi</strong>
                                                ${giftPackageMatch[1] ? `<br><strong>Mesaj:</strong> "${giftPackageMatch[1]}"` : ''}
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

                                <div class="section">
                                    <div class="section-title">Teslimat Bilgileri</div>
                                    <div class="shipping-address">
                                        ${detailedSession.collected_information?.shipping_details ? `
                                            <div class="address-line"><strong>Ad Soyad:</strong> ${detailedSession.collected_information.shipping_details.name}</div>
                                            <div class="address-line"><strong>Adres:</strong> ${detailedSession.collected_information.shipping_details.address?.line1 || ''}</div>
                                            ${detailedSession.collected_information.shipping_details.address?.line2 ? `<div class="address-line"><strong>Adres 2:</strong> ${detailedSession.collected_information.shipping_details.address.line2}</div>` : ''}
                                            <div class="address-line"><strong>Şehir:</strong> ${detailedSession.collected_information.shipping_details.address?.city || ''}</div>
                                            <div class="address-line"><strong>Posta Kodu:</strong> ${detailedSession.collected_information.shipping_details.address?.postal_code || ''}</div>
                                            <div class="address-line"><strong>Ülke:</strong> ${detailedSession.collected_information.shipping_details.address?.country || ''}</div>
                                        ` : '<div class="address-line">Teslimat bilgileri bulunamadı.</div>'}
                                    </div>
                                </div>

                                <div class="total-section">
                                    <div class="section-title" style="color: white; border-bottom: 1px solid rgba(255,255,255,0.2);">Ödeme Özeti</div>
                                    <div class="total-row">
                                        <span>Ürünler Toplamı:</span>
                                        <span>€${itemsTotal.toFixed(2)}</span>
                                    </div>
                                    <div class="total-row">
                                        <span>Kargo:</span>
                                        <span>€${shippingCost.toFixed(2)}</span>
                                    </div>
                                    <div class="total-row total-final">
                                        <span>Toplam:</span>
                                        <span>€${orderTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div class="important-info">
                                    <div class="important-title">Önemli Bilgiler</div>
                                    <div class="important-text">
                                        <strong>Takip:</strong> Kargo bilgileriniz e-posta ile gönderilecektir.
                                    </div>
                                    <div class="important-text">
                                        <strong>Sorularınız:</strong> info@grbt.studio adresinden bizimle iletişime geçebilirsiniz.
                                    </div>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <div class="footer-brand">grbt.</div>
                                <div class="footer-tagline">Memleketinizi Tişörtlerde Taşıyın</div>
                                <div class="footer-contact">
                                    Bu e-posta otomatik olarak gönderilmiştir.<br>
                                    © 2025 grbt. Tüm hakları saklıdır.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // Send detailed email
                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: customerEmail,
                    subject: `🎉 Siparişiniz Onaylandı - grbt.`,
                    html: emailHtml,
                });

                // Store order in Firebase using Admin SDK
                try {
                    const shippingDetails = detailedSession.collected_information?.shipping_details || detailedSession.customer_details?.address || null;

                    const orderData = {
                        stripe_id: session.id,
                        amount_total: session.amount_total || 0,
                        customer_email: customerEmail,
                        payment_status: session.payment_status || "paid",
                        status: session.status || "complete",
                        created: session.created || Math.floor(Date.now() / 1000),
                        shipping_details: shippingDetails,
                        line_items: lineItems,
                        shipped: false,
                        custom_flag: "",
                        notes: "",
                        deleted: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    const orderRef = adminDb.collection('orders').doc(session.id);
                    await orderRef.set(orderData);
                } catch (firebaseError) {
                    console.error("Error storing order in Firebase:", firebaseError);
                }
            }
        } catch (e) {
            console.error("Failed to send confirmation email", e);
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}

export const config = {
    api: {
        bodyParser: false,
    },
};


