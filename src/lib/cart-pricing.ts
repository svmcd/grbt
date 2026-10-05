import { getProductBySlug } from "./catalog";
import { getPriceForSlug } from "./pricing";
import { getTestPrice } from "./dev-mode";

// Price rules shared by the cart (what the customer sees) and /api/checkout (what Stripe charges).
// They mirror the product page: base price per design, +€20 for a long sleeve or sweater,
// +€30 for a hoodie, +€7.50 printed / +€10 embroidered personalization, +€5 gift packaging.

export const PRODUCT_TYPES = ["tshirt", "longsleeve", "hoodie", "sweater"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const GARMENT_SURCHARGE_EUR: Record<ProductType, number> = { tshirt: 0, longsleeve: 20, hoodie: 30, sweater: 20 };
export const PERSONALIZATION_COST_EUR = { printed: 7.5, embroidered: 10 } as const;
export type PersonalizationMethod = keyof typeof PERSONALIZATION_COST_EUR;
export const GIFT_PACKAGE_COST_EUR = 5;

// Input limits (the product page enforces the same text and message lengths)
export const PERSONALIZATION_FONTS = ["Normal", "Serif", "Cursive"];
export const MAX_PERSONALIZATION_TEXT = 20;
export const MAX_PERSONALIZATION_PLACEMENT = 120;
export const MAX_GIFT_MESSAGE = 100;
export const MAX_QUANTITY = 20;

export type PricedLine = {
    slug: string;
    productType: string;
    quantity: number;
    personalization?: { method: string } | null;
    giftPackage?: { included?: boolean } | null;
};

export function isCatalogSlug(slug: string): boolean {
    try {
        return getProductBySlug(slug)?.slug === slug;
    } catch {
        return false; // malformed URI encoding
    }
}

// Unit price in cents, or null when the slug is not in the catalog.
export function unitPriceCents(line: Omit<PricedLine, "quantity">): number | null {
    if (!isCatalogSlug(line.slug)) return null;
    const garment = GARMENT_SURCHARGE_EUR[line.productType as ProductType] ?? 0;
    const method = line.personalization?.method as PersonalizationMethod | undefined;
    const personalization = method ? PERSONALIZATION_COST_EUR[method] ?? 0 : 0;
    const gift = line.giftPackage?.included ? GIFT_PACKAGE_COST_EUR : 0;
    return Math.round(getTestPrice(getPriceForSlug(line.slug) + garment + personalization + gift) * 100);
}

// Bundle discount in cents, on every collection: 2 items €5, 3 or more €10.
export function memleketDiscountCents(lines: { slug: string; quantity: number }[]): number {
    const quantity = lines.reduce((sum, l) => sum + l.quantity, 0);
    if (quantity >= 3) return 1000;
    if (quantity >= 2) return 500;
    return 0;
}
