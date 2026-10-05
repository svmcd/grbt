import { isLocale, type Locale } from "@/i18n/config";
import common from "@/i18n/messages/common";
import { BRAND, SITE_URL, absolute, allProductSlugs, collectionOf, seoProduct } from "@/lib/seo/products";
import { getImagesForSlug } from "@/lib/catalog";
import { GARMENT_SURCHARGE_EUR, PRODUCT_TYPES, type ProductType } from "@/lib/cart-pricing";
import { colorName } from "@/lib/garments";

// Google Merchant Center product feed (RSS 2.0). Memleket: one item per garment type, colour
// and size; Hasret and Sinema: one item per T-shirt colour (siyah, beyaz) and size. All variants
// of a design share one item_group_id. Language with ?lang=en|de|fr|tr (default en); links go to
// the page in that language (/de/product/…) with type, colour and size preselected.
// Add in Merchant Center as a scheduled fetch of https://egrikuyu.com/feed.xml?lang=…
//
// IDs: T-shirts keep "<slug>-<colour>-<size>" (the ids Merchant Center already has for siyah and
// beyaz); long sleeves, hoodies and sweaters are "<slug>-<type>-<colour>-<size>".

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const variantId = (slug: string, type: ProductType, color: string, size: string) =>
    (type === "tshirt" ? `${slug}-${color}-${size}` : `${slug}-${type}-${color}-${size}`).toLowerCase();

export async function GET(request: Request) {
    const lang = new URL(request.url).searchParams.get("lang") || "en";
    const locale: Locale = isLocale(lang) ? lang : "en";
    const c = common[locale];

    const items: string[] = [];
    for (const slug of allProductSlugs()) {
        const p = seoProduct(slug, locale);
        if (!p) continue;
        const collection = collectionOf(slug);
        const types: readonly ProductType[] = collection === "memleket" ? PRODUCT_TYPES : ["tshirt"];
        // Sinema and Yabancı prints are on the front, the others on the back
        const printSide = collection === "sinema" || slug === "yabanci" ? (src: string) => !src.endsWith("back.png") : (src: string) => src.endsWith("back.png");
        for (const type of types) {
            const typeName = c.productTypes[type];
            const price = p.price + GARMENT_SURCHARGE_EUR[type];
            for (const color of p.colorsByType[type]) {
                // This colour's own photos (print side first, like the shop grid), then the shared ones
                const own = getImagesForSlug(slug, color, type).filter((src) => !src.includes("common"));
                const images = [...own.filter(printSide), ...own.filter((src) => !printSide(src))].map(absolute);
                if (!images.length) images.push(...p.images);
                const name = colorName(color, locale, type);
                for (const size of p.sizes) {
                    // Opens the product page with this variant selected (in the feed's language)
                    const link = `${p.url}?${new URLSearchParams({ type, color, size })}`;
                    items.push(`    <item>
      <g:id>${esc(variantId(slug, type, color, size))}</g:id>
      <g:item_group_id>${esc(slug)}</g:item_group_id>
      <g:title>${esc(`${p.city} ${typeName} ${name} ${size}`)}</g:title>
      <g:description>${esc(p.description)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(images[0])}</g:image_link>
${images.slice(1, 6).map((img) => `      <g:additional_image_link>${esc(img)}</g:additional_image_link>`).join("\n")}
      <g:availability>${p.inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${price.toFixed(2)} EUR</g:price>
      <g:brand>${esc(BRAND)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>212</g:google_product_category>
      <g:product_type>${esc(`${p.collection} > ${typeName}`)}</g:product_type>
      <g:color>${esc(name)}</g:color>
      <g:size>${esc(size)}</g:size>
      <g:gender>unisex</g:gender>
      <g:age_group>adult</g:age_group>
    </item>`);
                }
            }
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(BRAND)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(`${BRAND} products`)}</description>
${items.join("\n")}
  </channel>
</rss>
`;
    return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
