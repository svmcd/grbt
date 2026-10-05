import type { MetadataRoute } from "next";
import { SITE_URL, allProductSlugs, productUrl } from "@/lib/seo/products";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const pages = ["", "/collection/memleket", "/collection/hasret", "/collection/sinema", "/contact", "/shipping", "/returns", "/support", "/privacy", "/terms"];
    return [
        ...pages.map((path) => ({
            url: `${SITE_URL}${path}`,
            lastModified: now,
            changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
            priority: path === "" ? 1 : path.startsWith("/collection") ? 0.8 : 0.4,
        })),
        ...allProductSlugs().map((slug) => ({ url: productUrl(slug), lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 })),
    ];
}
