import { allCatalogSlugs, getImagesForSlug, printedOnFront, titleCaseCity } from "@/lib/catalog";
import { itemColorKey } from "./orders";

// Design title as stored on orders ("Nevşehir", "Sıla Yolu") → catalog slug
const SLUG_BY_TITLE = new Map(
    allCatalogSlugs().map((slug) => [titleCaseCity(slug).toLocaleLowerCase("tr"), slug]),
);

// Thumbnail showing the printed side of an ordered item, or null when unknown
export function designImage(title: string, productType: string, color: string): string | null {
    const slug = SLUG_BY_TITLE.get(title.trim().toLocaleLowerCase("tr"));
    if (!slug) return null;
    const type =
        productType === "Hoodie"
            ? "hoodie"
            : productType === "Sweater"
              ? "sweater"
              : productType === "Long Sleeve"
                ? "longsleeve"
                : productType === "T-shirt" || !productType
                  ? "tshirt"
                  : null;
    if (!type) return null;
    // Colour folder of the ordered garment colour (unknown colours show the default one)
    const key = itemColorKey({ productType: productType || "T-shirt", color })?.key ?? "siyah";
    const images = getImagesForSlug(slug, key, type);
    // Sinema and Yabancı are printed on the front; the others on the back
    if (printedOnFront(slug)) return images[0] || null;
    return images[1] || images[0] || null;
}
