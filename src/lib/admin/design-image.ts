import { getImagesForSlug, hasretSlugs, memleketSlugs, recepIvedikSlugs, titleCaseCity } from "@/lib/catalog";

// Design title as stored on orders ("Nevşehir", "Sıla Yolu") → catalog slug
const SLUG_BY_TITLE = new Map(
    [...memleketSlugs, ...hasretSlugs, ...recepIvedikSlugs].map((slug) => [titleCaseCity(slug).toLocaleLowerCase("tr"), slug]),
);

// Thumbnail showing the printed design (back side) of an ordered item, or null when unknown
export function designImage(title: string, productType: string, color: string): string | null {
    const slug = SLUG_BY_TITLE.get(title.trim().toLocaleLowerCase("tr"));
    if (!slug) return null;
    const type = productType === "Hoodie" ? "hoodie" : productType === "Sweater" ? "sweater" : productType === "T-shirt" || !productType ? "tshirt" : null;
    if (!type) return null;
    const images = getImagesForSlug(slug, color === "White" ? "beyaz" : "siyah", type);
    // Sinema designs are printed on the front; the others on the back
    if (recepIvedikSlugs.includes(slug)) return images[0] || null;
    return images[1] || images[0] || null;
}
