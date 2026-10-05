import type Stripe from "stripe";
import type { Locale } from "@/i18n/config";
import common from "@/i18n/messages/common";
import emails from "@/i18n/messages/emails";

// The cart fields the checkout route turns into a Stripe line item.
export type CheckoutItemInput = {
    city: string;
    productType: string;
    color: string;
    size: string;
    personalization?: {
        method: string;
        text: string;
        placement: string;
        font: string;
        color: string;
    };
    giftPackage?: {
        included: boolean;
        message?: string;
    };
};

const productTypeLabel = (item: CheckoutItemInput, locale: Locale) => {
    const types = common[locale].productTypes;
    return item.productType === "hoodie" ? types.hoodie : item.productType === "sweater" ? types.sweater : types.tshirt;
};

// Turkish keeps the raw stored color value ("siyah"), exactly as the names looked before localization.
const colorLabel = (color: string, locale: Locale) =>
    locale === "tr" ? color : common[locale].colors[color] ?? color;

// Name and description the customer sees in Stripe Checkout. For "tr" the output is identical to the
// strings the checkout route built before localization (orders and the admin dashboard rely on it).
export function describeCheckoutItem(item: CheckoutItemInput, locale: Locale): { name: string; description: string } {
    const c = common[locale];
    const e = emails[locale];
    const type = productTypeLabel(item, locale);
    const color = colorLabel(item.color, locale);

    const gift = item.giftPackage?.included && item.giftPackage?.message
        ? ` - ${e.colon(c.giftMessage)} "${item.giftPackage.message}"`
        : item.giftPackage?.included
            ? ` - ${c.giftPackage}`
            : "";

    const p = item.personalization;
    const personalization = p
        ? ` - ${e.colon(p.method === "printed" ? c.personalization.printed : c.personalization.embroidered)} "${p.text}" - ${p.placement} - ${e.colon(e.lineItem.font)} ${p.font} - ${e.colon(c.color)} ${p.color}`
        : "";

    return {
        name: `${item.city} ${type} - ${color}, ${item.size}${personalization}${gift}`,
        description: `${type}, ${color}, ${item.size}${personalization}${gift}`,
    };
}

// Stripe metadata values are limited to 500 characters.
const meta = (value: unknown) => String(value).slice(0, 500);

// Structured copy of the item, stored on the Stripe product so the webhook can rebuild the
// Turkish name for Firestore / the admin dashboard whatever language the customer used.
export function checkoutItemMetadata(item: CheckoutItemInput): Record<string, string> {
    const m: Record<string, string> = {
        city: meta(item.city),
        product_type: meta(item.productType),
        color: meta(item.color),
        size: meta(item.size),
    };
    if (item.personalization) {
        m.p_method = meta(item.personalization.method);
        m.p_text = meta(item.personalization.text);
        m.p_placement = meta(item.personalization.placement);
        m.p_font = meta(item.personalization.font);
        m.p_color = meta(item.personalization.color);
    }
    if (item.giftPackage?.included) {
        m.gift = "1";
        if (item.giftPackage.message) m.gift_message = meta(item.giftPackage.message);
    }
    // Stripe treats an empty value as "unset"; leave those keys out (they are read back as "").
    for (const key of Object.keys(m)) if (m[key] === "") delete m[key];
    return m;
}

function checkoutItemFromMetadata(m: Stripe.Metadata | null | undefined): CheckoutItemInput | null {
    if (!m || !m.product_type) return null;
    return {
        city: m.city ?? "",
        productType: m.product_type,
        color: m.color ?? "",
        size: m.size ?? "",
        personalization: m.p_method
            ? {
                method: m.p_method,
                text: m.p_text ?? "",
                placement: m.p_placement ?? "",
                font: m.p_font ?? "",
                color: m.p_color ?? "",
            }
            : undefined,
        giftPackage: m.gift ? { included: true, message: m.gift_message || undefined } : undefined,
    };
}

// Line items as they are stored in Firestore: same shape as before (price.product stays the product id)
// and the description in Turkish, rebuilt from the product metadata when the session carried it.
// Requires the session to be retrieved with expand: ["line_items.data.price.product"].
export function lineItemsForStorage(items: Stripe.LineItem[]): Stripe.LineItem[] {
    return items.map((li) => {
        const product = li.price?.product;
        if (!li.price || !product || typeof product === "string") return li;
        const item = "metadata" in product ? checkoutItemFromMetadata(product.metadata) : null;
        const stored = { ...li, price: { ...li.price, product: product.id } } as Stripe.LineItem;
        if (item) stored.description = describeCheckoutItem(item, "tr").name;
        return stored;
    });
}

// Country name for the Stripe shipping option, in the customer's language.
export function countryName(code: string | undefined, fallback: string | undefined, intlLocale: string): string | undefined {
    if (code) {
        try {
            const name = new Intl.DisplayNames([intlLocale], { type: "region" }).of(code);
            if (name && name !== code) return name;
        } catch {
            // fall through to the stored name
        }
    }
    return fallback;
}
