import { getAvailableColors, getImagesForSlug } from "@/lib/catalog";
import extraPhotos from "./extra-photos.json";

export const PRODUCT_TYPES = ["tshirt", "hoodie", "sweater"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

// Gallery images per variant, keyed "type|color". The catalog lists optional extra photos
// (common1-3.png) for every Memleket design; only the ones that exist are kept
// (extra-photos.json, written by scripts/product-extra-photos.mjs).
const existingExtras = new Set<string>(extraPhotos);
const isExtraPhoto = (src: string) => /\/common\d+\.png$/.test(src);

export const variantKey = (type: ProductType, color: string) => `${type}|${color}`;

// The product's own lifestyle photo for the band under the buy box, if it has one
export function bandPhotoForSlug(slug: string): string | null {
  const photo = `/products/collections/memleket/${slug}/siyah/common1.png`;
  return existingExtras.has(photo) ? photo : null;
}

export function galleryImagesForSlug(slug: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const type of PRODUCT_TYPES) {
    for (const color of getAvailableColors()) {
      out[variantKey(type, color)] = getImagesForSlug(slug, color, type).filter(
        (src) => Boolean(src) && (!isExtraPhoto(src) || existingExtras.has(src))
      );
    }
  }
  return out;
}
