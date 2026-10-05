import { localizePath, type Locale } from "@/i18n/config";
import common from "@/i18n/messages/common";
import { getImagesForSlug, getPrimaryImageForSlug, getProductBySlug, hasretSlugs, memleketSlugs, recepIvedikSlugs } from "@/lib/catalog";
import { getPriceForSlug, isAvailable } from "@/lib/pricing";

export const SITE_URL = "https://egrikuyu.com";
export const BRAND = "eğrikuyu";

export const allProductSlugs = () => [...memleketSlugs, ...hasretSlugs, ...recepIvedikSlugs];

export function collectionOf(slug: string): "memleket" | "hasret" | "sinema" {
    if (hasretSlugs.includes(slug)) return "hasret";
    if (recepIvedikSlugs.includes(slug)) return "sinema";
    return "memleket";
}

export const absolute = (path: string) => `${SITE_URL}${encodeURI(path)}`;
export const productPath = (slug: string) => `/product/${encodeURIComponent(slug)}`;
// Product page URL in a language: English unprefixed, the others under /de, /fr, /tr
export const productUrl = (slug: string, locale: Locale = "en") => `${SITE_URL}${localizePath(productPath(slug), locale)}`;

// Everything search engines need about one product, in the visitor's language
export function seoProduct(slug: string, locale: Locale) {
    const product = getProductBySlug(slug, locale);
    if (!product) return null;
    const c = common[locale];
    const name = `${product.city} ${c.productTypes.tshirt}`;
    const images = [getPrimaryImageForSlug(slug), ...getImagesForSlug(slug)]
        .filter((src, i, all) => all.indexOf(src) === i && !src.includes("common"))
        .map(absolute);
    return {
        slug,
        city: product.city,
        name,
        description: product.description,
        collection: c.collections[collectionOf(slug)],
        images,
        price: getPriceForSlug(slug),
        inStock: isAvailable(slug),
        url: productUrl(slug, locale),
        colorsByType: product.colorsByType,
        sizes: product.sizes,
    };
}
