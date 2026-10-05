import Stripe from "stripe";
import { deliveryDays, getCountryName, isShippingCountry, shippingCents } from "@/lib/shipping";
import { isLocale, localizePath, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import common from "@/i18n/messages/common";
import emails from "@/i18n/messages/emails";
import { checkoutItemMetadata, describeCheckoutItem, truncate, type CheckoutItemInput } from "@/lib/emails/line-items";
import { recordEvent, visitorFromRequest } from "@/lib/traffic";
import { getProductBySlug, memleketSlugs } from "@/lib/catalog";
import { isAvailable } from "@/lib/pricing";
import {
    MAX_GIFT_MESSAGE,
    MAX_PERSONALIZATION_PLACEMENT,
    MAX_PERSONALIZATION_TEXT,
    MAX_QUANTITY,
    PERSONALIZATION_COST_EUR,
    PERSONALIZATION_FONTS,
    PRODUCT_TYPES,
    isCatalogSlug,
    memleketDiscountCents,
    unitPriceCents,
    type PersonalizationMethod,
    type ProductType,
} from "@/lib/cart-pricing";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
    : (null as any);

const MAX_LINES = 50;

// A cart line after validation. Prices are never read from the request.
type CheckoutLine = CheckoutItemInput & {
    slug: string;
    productType: ProductType;
    quantity: number;
    unitCents: number;
};

class BadRequest extends Error {}

// Free text from the browser: no control characters, trimmed
const cleanText = (value: unknown): string =>
    typeof value === "string" ? value.replace(/[\u0000-\u001F\u007F]/g, " ").trim() : "";

function parseLine(raw: unknown): CheckoutLine {
    if (!raw || typeof raw !== "object") throw new BadRequest("Invalid item");
    const item = raw as Record<string, unknown>;

    const slug = typeof item.slug === "string" ? item.slug : "";
    if (!isCatalogSlug(slug) || !isAvailable(slug)) throw new BadRequest("Unknown product");
    const product = getProductBySlug(slug)!;

    const productType = item.productType;
    if (typeof productType !== "string" || !(PRODUCT_TYPES as readonly string[]).includes(productType)) {
        throw new BadRequest("Unknown product type");
    }
    if (typeof item.color !== "string" || !product.colors.includes(item.color)) throw new BadRequest("Unknown color");
    if (typeof item.size !== "string" || !product.sizes.includes(item.size)) throw new BadRequest("Unknown size");

    const rawQuantity = Number(item.quantity);
    if (!Number.isFinite(rawQuantity)) throw new BadRequest("Invalid quantity");
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(rawQuantity)));

    let personalization: CheckoutLine["personalization"];
    if (item.personalization) {
        const p = item.personalization as Record<string, unknown>;
        const method = p.method;
        if (typeof method !== "string" || !Object.hasOwn(PERSONALIZATION_COST_EUR, method)) {
            throw new BadRequest("Invalid personalization");
        }
        const text = cleanText(p.text);
        const placement = cleanText(p.placement);
        const font = typeof p.font === "string" ? p.font : "";
        const color = typeof p.color === "string" ? p.color : "";
        if (!text || [...text].length > MAX_PERSONALIZATION_TEXT) throw new BadRequest("Invalid personalization text");
        if (!placement || [...placement].length > MAX_PERSONALIZATION_PLACEMENT) {
            throw new BadRequest("Invalid personalization placement");
        }
        if (!PERSONALIZATION_FONTS.includes(font)) throw new BadRequest("Invalid personalization font");
        if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new BadRequest("Invalid personalization color");
        personalization = { method: method as PersonalizationMethod, text, placement, font, color };
    }

    let giftPackage: CheckoutLine["giftPackage"];
    if (item.giftPackage && (item.giftPackage as Record<string, unknown>).included === true) {
        const message = truncate(cleanText((item.giftPackage as Record<string, unknown>).message), MAX_GIFT_MESSAGE);
        giftPackage = { included: true, ...(message ? { message } : {}) };
    }

    const unitCents = unitPriceCents({ slug, productType, personalization, giftPackage });
    if (unitCents === null) throw new BadRequest("Unknown product");

    return {
        slug,
        city: product.city,
        productType: productType as ProductType,
        color: item.color,
        size: item.size,
        quantity,
        personalization,
        giftPackage,
        unitCents,
    };
}

export async function POST(request: Request) {
    try {
        if (!STRIPE_SECRET_KEY || !stripe) {
            return Response.json(
                { error: "Stripe secret key not configured" },
                { status: 500 }
            );
        }

        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const locale: Locale = isLocale(body.locale) ? body.locale : await getLocale();
        const ship = emails[locale].lineItem;

        // Only these are read from the browser: product, type, color, size, quantity,
        // personalization and gift fields, locale and shipping country. Prices, discount
        // and shipping are computed here.
        if (!Array.isArray(body.items) || body.items.length === 0) {
            return Response.json({ error: "No items provided" }, { status: 400 });
        }
        if (body.items.length > MAX_LINES) {
            return Response.json({ error: "Too many items" }, { status: 400 });
        }
        const shippingCountry = typeof body.shippingCountry === "string" ? body.shippingCountry.toUpperCase() : "";
        if (!isShippingCountry(shippingCountry)) {
            return Response.json({ error: "Unsupported shipping country" }, { status: 400 });
        }

        // A bad line answers with its index so the cart can point at the item to remove
        const lines: CheckoutLine[] = [];
        for (const [index, raw] of (body.items as unknown[]).entries()) {
            try {
                lines.push(parseLine(raw));
            } catch (e) {
                if (e instanceof BadRequest) return Response.json({ error: e.message, line: index }, { status: 400 });
                throw e;
            }
        }

        // Same rules as the cart: Memleket family discount on the first Memleket line,
        // free shipping measured on the items subtotal before discounts.
        const subtotalCents = lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
        const discountCents = memleketDiscountCents(lines);
        const shippingAmountCents = shippingCents(subtotalCents);

        // Stripe takes unit prices, so the discount goes on one unit of the first Memleket line
        // (split off when that line has more than one unit). Unit prices are at least €30,
        // so the discounted unit never drops below zero.
        const discountIndex = discountCents > 0 ? lines.findIndex((l) => memleketSlugs.includes(l.slug)) : -1;
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        lines.forEach((line, index) => {
            const text = describeCheckoutItem(line, locale);
            const priceData = (unitAmount: number) => ({
                currency: "eur",
                product_data: {
                    name: text.name,
                    description: text.description,
                    // Lets the webhook store the Turkish name for the admin dashboard
                    metadata: checkoutItemMetadata(line),
                },
                unit_amount: unitAmount,
            });
            if (index === discountIndex) {
                if (line.quantity > 1) lineItems.push({ price_data: priceData(line.unitCents), quantity: line.quantity - 1 });
                lineItems.push({ price_data: priceData(Math.max(0, line.unitCents - discountCents)), quantity: 1 });
            } else {
                lineItems.push({ price_data: priceData(line.unitCents), quantity: line.quantity });
            }
        });

        // Gift messages for the shop (always Turkish), within Stripe's 500-character metadata limit
        const trTypes = common.tr.productTypes;
        const giftMessages = lines
            .filter((l) => l.giftPackage?.message)
            .map((l) => `${l.city} ${trTypes[l.productType]} (${l.color}, ${l.size}): "${l.giftPackage!.message}"`);

        // Store analytics: anonymous daily visitor id, so the purchase can be linked to the visit
        const trackHost = (request.headers.get("host") || "").endsWith("egrikuyu.com");
        const visitor = trackHost ? visitorFromRequest(request.headers) : null;

        const days = deliveryDays(shippingCountry);
        const countryName = getCountryName(shippingCountry, locale);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: [
                "card",
                "paypal",
                "bancontact",
                "ideal",
                "klarna"
            ],
            line_items: lineItems,
            shipping_options: [{
                shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: shippingAmountCents,
                        currency: "eur",
                    },
                    display_name: shippingAmountCents === 0
                        ? ship.freeShippingTo(countryName)
                        : ship.shippingTo(countryName),
                    delivery_estimate: {
                        minimum: { unit: "business_day", value: days.min },
                        maximum: { unit: "business_day", value: days.max },
                    },
                },
            }],
            mode: "payment",
            // Collect customer email
            customer_creation: "always",
            // Enable coupon codes in Stripe checkout
            allow_promotion_codes: true,
            // Only the country the shipping price was calculated for
            shipping_address_collection: {
                allowed_countries: [shippingCountry],
            },
            // Stripe Checkout page language
            locale,
            // Gift messages (Turkish, for the shop) and the customer's language for emails
            metadata: {
                ...(giftMessages.length > 0 ? { gift_messages: truncate(giftMessages.join(" | "), 500) } : {}),
                locale,
                ...(visitor ? { vh: visitor.hash, vd: visitor.day } : {}),
            },
            success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            // Back to the cart in the buyer's language ("/tr?cart=open")
            cancel_url: `${baseUrl}${localizePath("/", locale)}?cart=open`,
        });

        if (visitor) {
            await recordEvent({ event: "begin_checkout", value: session.amount_total || 0 }, visitor).catch((e) =>
                console.error("track begin_checkout failed:", e)
            );
        }

        return Response.json({ url: session.url });
    } catch (error) {
        console.error("Stripe error details:", error);
        return Response.json(
            { error: "Payment processing failed" },
            { status: 500 }
        );
    }
}
