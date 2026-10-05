import type Stripe from "stripe";
import { intlLocales, isLocale, type Locale } from "@/i18n/config";
import common from "@/i18n/messages/common";
import emails from "@/i18n/messages/emails";
import { getCountryName } from "@/lib/shipping";
import { orderNumber } from "@/lib/order-number";
import { GARMENTS } from "@/lib/garments";
import { colorLabel } from "./line-items";

// Locale of a Checkout Session. Sessions created before localization have none: those customers
// all used the Turkish site, so they fall back to "tr".
export function sessionLocale(session: { metadata?: Stripe.Metadata | null }): Locale {
    const value = session.metadata?.locale;
    return isLocale(value) ? value : "tr";
}

// Design of the email. Customers get "minimal" (black and white), sent by the Stripe webhook
// /api/checkout-session-completed. "classic" and "classic-emoji" are older designs, kept for reuse.
export type OrderEmailVariant = "minimal" | "classic" | "classic-emoji";

export type OrderEmailInput = {
    locale: Locale;
    variant: OrderEmailVariant;
    created: number; // unix seconds
    sessionId?: string; // Stripe Checkout Session id; shown as the order number
    orderTotal: number; // euros
    shippingCost: number; // euros
    itemsTotal: number; // euros
    lineItems: Stripe.LineItem[];
    shipping: { name?: string | null; address?: Stripe.Address | null } | null | undefined;
};

const STYLES: Record<OrderEmailVariant, string> = {
    classic: `
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
                        `,
    "classic-emoji": `
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
            position: relative;
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
                    .status-icon {
                        font-size: 24px;
                        margin-bottom: 8px;
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
                        font-size: 14px;
                        color: #2c3e50;
                        font-weight: 500;
                    }
                    .product-item { 
                        background: #f8f9fa; 
                        padding: 20px; 
                        margin: 15px 0; 
                        border-radius: 10px;
                        border-left: 4px solid #000000;
                        transition: all 0.3s ease;
                    }
                    .product-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    }
                    .product-name { 
                        font-weight: 700; 
                        font-size: 18px; 
                        color: #2c3e50;
                        margin-bottom: 8px;
                    }
                    .product-details { 
                        color: #6c757d; 
                        font-size: 14px; 
                        margin: 6px 0;
                        line-height: 1.5;
                    }
                    .product-price { 
                        color: #000000; 
                        font-weight: 700; 
                        font-size: 16px;
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 1px solid #dee2e6;
                    }
                    .personalization-badge {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        display: inline-block;
                        margin: 5px 5px 5px 0;
                    }
                    .gift-badge {
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
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
                `,
    minimal: `
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
                        `,
};

// Values the description parsing looks for: every garment colour name as the line item writes it
// (colorLabel), longest first so "Heather Gray" wins over "Gray". Turkish also keeps the older words.
const LEGACY_TR_COLORS = ["mavi", "kırmızı", "yeşil", "sarı", "mor", "pembe", "turuncu", "gri"];
function colorPattern(locale: Locale): RegExp {
    const names = new Set<string>();
    for (const g of Object.values(GARMENTS)) for (const col of g.colors) names.add(colorLabel(col.key, locale, g.type));
    if (locale === "tr") LEGACY_TR_COLORS.forEach((n) => names.add(n));
    const alternatives = [...names].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp(`(${alternatives.join("|")})`, "i");
}

function sizePattern(locale: Locale): RegExp {
    // Turkish keeps the original pattern; the others need word boundaries ("T-Shirt", "Schwarz").
    return locale === "tr" ? /(S|M|L|XL|XXL)/ : /\b(XXL|XL|S|M|L)\b/;
}

export function buildOrderConfirmationEmail(input: OrderEmailInput): { subject: string; html: string } {
    const { locale, variant, lineItems, shipping } = input;
    const c = common[locale];
    const e = emails[locale];
    const o = e.orderConfirmation;
    const L = e.colon;
    const minimal = variant === "minimal";
    const emoji = variant === "classic-emoji";
    const title = (icon: string, text: string) => (emoji ? `${icon} ${text}` : text);
    const contactEmail = minimal ? "info@egrikuyu.com" : "info@egrikuyu.com";

    const thanksBox = minimal
        ? { box: "text-align: center; margin: 30px 0; padding: 20px;", p1: "font-size: 16px; color: #000000; margin-bottom: 10px; font-weight: 300;", p2: "font-size: 14px; color: #666666; line-height: 1.6;" }
        : { box: "text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;", p1: "font-size: 16px; color: #2c3e50; margin-bottom: 10px; font-weight: 500;", p2: "font-size: 14px; color: #6c757d; line-height: 1.6;" };

    const products = lineItems.map(item => {
        const desc = item.description || '';
        const colorMatch = desc.match(colorPattern(locale));
        const sizeMatch = desc.match(sizePattern(locale));
        const personalizationMatch = desc.match(/• (Baskı|İşleme) • "([^"]+)" • ([^•]+) • Font: ([^•]+) • Renk: ([^•]+)/);
        const giftPackageMatch = desc.match(/• Hediye Paketi(?: • Mesaj: "([^"]+)")?/);
        const productName = (item as any).price_data?.product_data?.name || o.productFallback;
        const quantity = item.quantity || 1;
        const unitPrice = ((item as any).price_data?.unit_amount || (item as any).amount || 0) / 100;

        const personalizationHtml = personalizationMatch
            ? minimal
                ? `
                <div class="product-details">
                    <strong>${personalizationMatch[1]}:</strong> "${personalizationMatch[2]}"<br>
                    <strong>${L(o.placement)}</strong> ${personalizationMatch[3]}<br>
                    <strong>${L(o.font)}</strong> ${personalizationMatch[4]} • <strong>${L(c.color)}</strong> ${personalizationMatch[5]}
                </div>`
                : `
                <div class="product-details">
                    <span class="personalization-badge">${personalizationMatch[1]}</span>
                    <strong>${L(o.text)}</strong> "${personalizationMatch[2]}"<br>
                    <strong>${L(o.placement)}</strong> ${personalizationMatch[3]}<br>
                    <strong>${L(o.font)}</strong> ${personalizationMatch[4]} • <strong>${L(c.color)}</strong> ${personalizationMatch[5]}
                </div>`
            : '';

        const giftLabel = minimal
            ? `<strong>${c.giftPackage}</strong>`
            : `<span class="gift-badge">${emoji ? `🎁 ${c.giftPackage}` : c.giftPackage}</span>`;
        const giftHtml = giftPackageMatch
            ? `
                <div class="product-details">
                    ${giftLabel}
                    ${giftPackageMatch[1] ? `<br><strong>${L(o.message)}</strong> "${giftPackageMatch[1]}"` : ''}
                </div>`
            : '';

        return `
            <div class="product-item">
                <div class="product-name">${productName}</div>
                <div class="product-details">
                    ${colorMatch ? `<strong>${L(c.color)}</strong> ${colorMatch[1].toLocaleUpperCase(intlLocales[locale])}` : ''}
                    ${sizeMatch ? ` • <strong>${L(c.size)}</strong> ${sizeMatch[1]}` : ''}
                </div>
                ${personalizationHtml}
                ${giftHtml}
                <div class="product-details">
                    <strong>${L(c.quantity)}</strong> ${quantity} • <strong>${L(o.unitPrice)}</strong> €${unitPrice.toFixed(2)}
                </div>
                <div class="product-price">${L(c.total)} €${(unitPrice * quantity).toFixed(2)}</div>
            </div>
        `;
    }).join('');

    const address = shipping
        ? `
            <div class="address-line"><strong>${L(o.fullName)}</strong> ${shipping.name}</div>
            <div class="address-line"><strong>${L(o.address)}</strong> ${shipping.address?.line1 || ''}</div>
            ${shipping.address?.line2 ? `<div class="address-line"><strong>${L(o.address2)}</strong> ${shipping.address.line2}</div>` : ''}
            <div class="address-line"><strong>${L(o.city)}</strong> ${shipping.address?.city || ''}</div>
            <div class="address-line"><strong>${L(o.postalCode)}</strong> ${shipping.address?.postal_code || ''}</div>
            <div class="address-line"><strong>${L(o.country)}</strong> ${shipping.address?.country ? getCountryName(shipping.address.country, locale) : ''}</div>
        `
        : `<div class="address-line">${o.noShipping}</div>`;

    const importantTitle = minimal
        ? `<div class="important-title">${o.importantInfo}</div>`
        : `<div class="important-title">
                <span class="important-icon">ℹ️</span>
                ${o.importantInfo}
            </div>`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${o.docTitle}</title>
            <style>${STYLES[variant]}</style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">eğrikuyu</div>
                    <div class="header-subtitle">${e.layout.tagline}</div>
                </div>

                <div class="content">
                    <div class="greeting">${minimal ? o.greetingMinimal : o.greetingClassic}</div>

                    <div class="order-status">
                        <div class="status-text">${minimal ? o.statusMinimal : o.statusClassic}</div>
                    </div>

                    <div style="${thanksBox.box}">
                        <p style="${thanksBox.p1}">
                            ${minimal ? o.thanksMinimal : o.thanksClassic}
                        </p>
                        <p style="${thanksBox.p2}">
                            ${o.intro}
                        </p>
                    </div>

                    <div class="section">
                        <div class="section-title">${title("📋", o.orderInfo)}</div>
                        <div class="order-info">
                            ${input.sessionId ? `<div class="info-item">
                                <div class="info-label">${o.orderNumber}</div>
                                <div class="info-value">${orderNumber(input.sessionId)}</div>
                            </div>` : ''}
                            <div class="info-item">
                                <div class="info-label">${o.orderDate}</div>
                                <div class="info-value">${new Date(input.created * 1000).toLocaleDateString(intlLocales[locale])}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">${o.totalAmount}</div>
                                <div class="info-value">€${input.orderTotal.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">${title("🛍️", o.orderedItems)}</div>
                        ${products}
                    </div>

                    <div class="section">
                        <div class="section-title">${title("🚚", o.shippingInfo)}</div>
                        <div class="shipping-address">
                            ${address}
                        </div>
                    </div>

                    <div class="total-section">
                        <div class="section-title" style="color: white; border-bottom: 1px solid rgba(255,255,255,0.2);">${title("💰", o.paymentSummary)}</div>
                        <div class="total-row">
                            <span>${L(o.itemsTotal)}</span>
                            <span>€${input.itemsTotal.toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span>${L(c.shipping)}</span>
                            <span>€${input.shippingCost.toFixed(2)}</span>
                        </div>
                        <div class="total-row total-final">
                            <span>${L(c.total)}</span>
                            <span>€${input.orderTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="important-info">
                        ${importantTitle}
                        <div class="important-text">
                            <strong>${L(o.trackingLabel)}</strong> ${o.trackingText}
                        </div>
                        <div class="important-text">
                            <strong>${L(o.questionsLabel)}</strong> ${o.questionsText(contactEmail)}
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-brand">eğrikuyu</div>
                    <div class="footer-tagline">${e.layout.tagline}</div>
                    <div class="footer-contact">
                        ${e.layout.autoSent}<br>
                        ${e.layout.copyright}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return { subject: o.subject, html };
}
