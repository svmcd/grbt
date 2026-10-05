import type { MetadataRoute } from "next";
import { locales, localizePath } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo/products";

// Private pages, also under the language prefixes (/tr/checkout, /de/order/…)
const PRIVATE = ["/checkout", "/order/", "/review/"];

export default function robots(): MetadataRoute.Robots {
    const localized = locales.filter((l) => l !== "en").flatMap((l) => PRIVATE.map((path) => localizePath(path, l)));
    return {
        rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", ...PRIVATE, ...localized] }],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
