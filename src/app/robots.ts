import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/products";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout", "/order/", "/review/"] }],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
