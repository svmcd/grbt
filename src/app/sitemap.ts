import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { allProductSlugs, productPath } from "@/lib/seo/products";
import { STATIC_PAGES, languageAlternates, localeUrl } from "@/lib/seo/locales";

// Every page in all four languages (English unprefixed, /de, /fr, /tr), each entry
// listing its language versions so Google pairs them up
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const entries = (path: string, changeFrequency: "daily" | "weekly", priority: number) =>
        locales.map((locale) => ({
            url: localeUrl(path, locale),
            lastModified: now,
            changeFrequency,
            priority,
            alternates: { languages: languageAlternates(path) },
        }));
    return [
        ...STATIC_PAGES.flatMap((path) =>
            entries(path, path === "/" ? "daily" : "weekly", path === "/" ? 1 : path.startsWith("/collection") ? 0.8 : 0.4)
        ),
        ...allProductSlugs().flatMap((slug) => entries(productPath(slug), "weekly", 0.9)),
    ];
}
