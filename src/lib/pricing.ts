import { getTestPrice } from "./dev-mode";

export const defaultPriceEur = 40;

// Optional: manage per-product overrides here
const perProductOverrides: Record<string, { price?: number; available?: boolean }> = {
    // Hasret collection pricing
    "gurbetten-memlekete": { price: 35 },
    "sıla-yolu": { price: 35 },
    "yabanci": { price: 30 },
};

export function getPriceForSlug(slug: string): number {
    const override = perProductOverrides[slug]?.price;
    const price = typeof override === "number" ? override : defaultPriceEur;

    // Apply test mode pricing in development
    return getTestPrice(price);
}

export function isAvailable(slug: string): boolean {
    const override = perProductOverrides[slug]?.available;
    return typeof override === "boolean" ? override : true;
}


