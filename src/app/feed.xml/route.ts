import { isLocale, type Locale } from "@/i18n/config";
import common from "@/i18n/messages/common";
import { BRAND, SITE_URL, absolute, allProductSlugs, collectionOf, seoProduct } from "@/lib/seo/products";
import { getImagesForSlug } from "@/lib/catalog";

// Google Merchant Center product feed (RSS 2.0). One item per T-shirt colour and size,
// grouped per design. Language with ?lang=en|de|fr|tr (default en); links go to the
// page in that language (/de/product/…) with the colour and size preselected.
// Add in Merchant Center as a scheduled fetch of https://egrikuyu.com/feed.xml?lang=…

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(request: Request) {
    const lang = new URL(request.url).searchParams.get("lang") || "en";
    const locale: Locale = isLocale(lang) ? lang : "en";
    const c = common[locale];

    const items: string[] = [];
    for (const slug of allProductSlugs()) {
        const p = seoProduct(slug, locale);
        if (!p) continue;
        for (const color of p.colors) {
            // This colour's own photos (back first, like the shop grid), then the shared ones
            const own = getImagesForSlug(slug, color).filter((src) => !src.includes("common"));
            // Sinema and Yabancı prints are on the front, the others on the back
            const printSide = collectionOf(slug) === "sinema" || slug === "yabanci" ? (src: string) => !src.endsWith("back.png") : (src: string) => src.endsWith("back.png");
            const images = [...own.filter(printSide), ...own.filter((src) => !printSide(src))].map(absolute);
            if (!images.length) images.push(...p.images);
            for (const size of p.sizes) {
                const id = `${slug}-${color}-${size}`.toLowerCase();
                const colorName = c.colors[color] ?? color;
                // Opens the product page with this variant selected (in the feed's language)
                const link = `${p.url}?${new URLSearchParams({ type: "tshirt", color, size })}`;
                items.push(`    <item>
      <g:id>${esc(id)}</g:id>
      <g:item_group_id>${esc(slug)}</g:item_group_id>
      <g:title>${esc(`${p.name} ${colorName} ${size}`)}</g:title>
      <g:description>${esc(p.description)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(images[0])}</g:image_link>
${images.slice(1, 6).map((img) => `      <g:additional_image_link>${esc(img)}</g:additional_image_link>`).join("\n")}
      <g:availability>${p.inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${p.price.toFixed(2)} EUR</g:price>
      <g:brand>${esc(BRAND)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>212</g:google_product_category>
      <g:product_type>${esc(`${p.collection} > ${c.productTypes.tshirt}`)}</g:product_type>
      <g:color>${esc(colorName)}</g:color>
      <g:size>${esc(size)}</g:size>
      <g:gender>unisex</g:gender>
      <g:age_group>adult</g:age_group>
    </item>`);
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
