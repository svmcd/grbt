import Stripe from "stripe";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Email configurationn
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
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Sipariş Onayı - grbt.</title>
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
                            .greeting {
                                font-size: 18px;
                                margin-bottom: 20px;
                                color: #2c3e50;
                            }
                            .order-status {
                                background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                                color: white;
                                padding: 20px;
                                border-radius: 12px;
                                text-align: center;
                                margin-bottom: 30px;
                                box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
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
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                            }
                            .section-title { 
                                font-size: 18px; 
                                font-weight: 700; 
                                color: #2c3e50; 
                                margin-bottom: 20px;
                                padding-bottom: 10px;
                                border-bottom: 2px solid #f8f9fa;
                            }
                            .order-info {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 15px;
                                margin-bottom: 20px;
                            }
                            .info-item {
                                background: #f8f9fa;
                                padding: 15px;
                                border-radius: 8px;
                                border-left: 4px solid #000000;
                            }
                            .info-label {
                                font-size: 12px;
                                color: #6c757d;
                                text-transform: uppercase;
                                font-weight: 600;
                                letter-spacing: 0.5px;
                                margin-bottom: 4px;
                            }
                            .info-value {
                                font-size: 16px;
                                font-weight: 600;
                                color: #2c3e50;
                            }
                            .product-item {
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 15px 0;
                                border: 1px solid #e9ecef;
                            }
                            .product-name {
                                font-size: 18px;
                                font-weight: 700;
                                color: #2c3e50;
                                margin-bottom: 10px;
                            }
                            .product-details {
                                font-size: 14px;
                                color: #495057;
                                margin: 5px 0;
                                line-height: 1.5;
                            }
                            .product-price {
                                font-size: 16px;
                                font-weight: 700;
                                color: #000000;
                                margin-top: 10px;
                                padding-top: 10px;
                                border-top: 1px solid #dee2e6;
                            }
                            .personalization-badge {
                                background: #007bff;
                                color: white;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 12px;
                                font-weight: 600;
                                display: inline-block;
                                margin: 5px 5px 5px 0;
                            }
                            .gift-badge {
                                background: #28a745;
                                color: white;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 12px;
                                font-weight: 600;
                                display: inline-block;
                                margin: 5px 5px 5px 0;
                            }
                            .shipping-address {
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 8px;
                                border: 1px solid #e9ecef;
                            }
                            .address-line {
                                margin: 5px 0;
                                font-size: 14px;
                                color: #495057;
                            }
                            .total-section {
                                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                                color: white;
                                padding: 25px;
                                border-radius: 12px;
                                margin: 25px 0;
                            }
                            .total-row {
                                display: flex;
                                justify-content: space-between;
                                margin: 8px 0;
                                font-size: 14px;
                            }
                            .total-final {
                                font-size: 20px;
                                font-weight: 700;
                                border-top: 2px solid rgba(255, 255, 255, 0.2);
                                padding-top: 10px;
                                margin-top: 15px;
                            }
                            .important-info {
                                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                                color: white;
                                padding: 25px;
                                border-radius: 12px;
                                margin: 30px 0;
                                box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);
                            }
                            .important-title {
                                font-size: 16px;
                                font-weight: 700;
                                margin-bottom: 15px;
                                display: flex;
                                align-items: center;
                            }
                            .important-icon {
                                margin-right: 8px;
                                font-size: 18px;
                            }
                            .important-text {
                                font-size: 14px;
                                line-height: 1.6;
                                margin: 8px 0;
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
                                <div class="greeting">Merhaba!</div>
                                
                                <div class="order-status">
                                    <div class="status-text">Siparişiniz Başarıyla Alındı!</div>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                                    <p style="font-size: 16px; color: #2c3e50; margin-bottom: 10px; font-weight: 500;">
                                        Siparişiniz için teşekkür ederiz!
                                    </p>
                                    <p style="font-size: 14px; color: #6c757d; line-height: 1.6;">
                                        Memleket gururunuzu bizimle paylaştığınız için çok mutluyuz. 
                                        Ürünlerinizi özenle hazırlayıp en kısa sürede size ulaştıracağız.
                                    </p>
                                </div>
                                
                                <div class="section">
                                    <div class="section-title">Sipariş Bilgileri</div>
                                    <div class="order-info">
                                        <div class="info-item">
                                            <div class="info-label">Sipariş Tarihi</div>
                                            <div class="info-value">${new Date(session.created * 1000).toLocaleDateString('tr-TR')}</div>
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
                                                <span class="personalization-badge">${personalizationMatch[1]}</span>
                                                <strong>Metin:</strong> "${personalizationMatch[2]}"<br>
                                                <strong>Yerleşim:</strong> ${personalizationMatch[3]}<br>
                                                <strong>Font:</strong> ${personalizationMatch[4]} • <strong>Renk:</strong> ${personalizationMatch[5]}
                                            </div>
                                            ` : ''}
                                            ${giftPackageMatch ? `
                                            <div class="product-details">
                                                <span class="gift-badge">Hediye Paketi</span>
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
                                        ${(session as any).shipping_details ? `
                                            <div class="address-line"><strong>Ad Soyad:</strong> ${(session as any).shipping_details.name}</div>
                                            <div class="address-line"><strong>Adres:</strong> ${(session as any).shipping_details.address?.line1 || ''}</div>
                                            ${(session as any).shipping_details.address?.line2 ? `<div class="address-line"><strong>Adres 2:</strong> ${(session as any).shipping_details.address.line2}</div>` : ''}
                                            <div class="address-line"><strong>Şehir:</strong> ${(session as any).shipping_details.address?.city || ''}</div>
                                            <div class="address-line"><strong>Posta Kodu:</strong> ${(session as any).shipping_details.address?.postal_code || ''}</div>
                                            <div class="address-line"><strong>Ülke:</strong> ${(session as any).shipping_details.address?.country || ''}</div>
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
                                    <div class="important-title">
                                        <span class="important-icon">ℹ️</span>
                                        Önemli Bilgiler
                                    </div>
                                    <div class="important-text">
                                        <strong>Takip:</strong> Kargo bilgileriniz e-posta ile gönderilecektir.
                                    </div>
                                    <div class="important-text">
                                        <strong>Sorularınız:</strong> studio@grbt.studio adresinden bizimle iletişime geçebilirsiniz.
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

                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: session.customer_email,
                    subject: `🎉 Siparişiniz Onaylandı - grbt.`,
                    html: emailHtml,
                });

                console.log(`Confirmation email sent to ${session.customer_email}`);

                // Store order in Firebase using Admin SDK
                try {
                    const orderData = {
                        stripe_id: session.id,
                        amount_total: session.amount_total || 0,
                        customer_email: session.customer_email || "",
                        payment_status: session.payment_status || "paid",
                        status: session.status || "complete",
                        created: session.created || Math.floor(Date.now() / 1000),
                        shipping_details: (session as any).shipping_details || null,
                        line_items: expandedSession.line_items?.data || [],
                        shipped: false,
                        custom_flag: "",
                        notes: "",
                        deleted: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    const orderRef = adminDb.collection('orders').doc(session.id);
                    await orderRef.set(orderData);
                    console.log(`✅ Order ${session.id} stored in Firebase`);
                } catch (firebaseError) {
                    console.error("❌ Error storing order in Firebase:", firebaseError);
                }
            }
        } catch (error) {
            console.error("Error sending confirmation email:", error);
        }
    }

    return Response.json({ received: true });
}
