import type { Metadata } from "next";
import { locales, localizePath, type Locale } from "@/i18n/config";
import { SITE_URL } from "./products";

// Absolute URL of `path` in `locale`: https://egrikuyu.com/shipping, https://egrikuyu.com/tr/shipping
export function localeUrl(path: string, locale: Locale): string {
    const localized = localizePath(path, locale);
    return localized === "/" ? SITE_URL : `${SITE_URL}${localized}`;
}

// hreflang map for one page: every language plus x-default (the unprefixed English URL)
export function languageAlternates(path: string): Record<Locale | "x-default", string> {
    const languages = Object.fromEntries(locales.map((l) => [l, localeUrl(path, l)])) as Record<Locale, string>;
    return { ...languages, "x-default": localeUrl(path, "en") };
}

// Next metadata `alternates`: self-referencing canonical for this language version + hreflang
export function alternatesFor(path: string, urlLocale: Locale): NonNullable<Metadata["alternates"]> {
    return { canonical: localeUrl(path, urlLocale), languages: languageAlternates(path) };
}

// Indexable static pages. The root layout gives them their
// canonical and hreflang links; the sitemap lists them in every language.
export const STATIC_PAGES = [
    "/",
    "/collection",
    "/collection/memleket",
    "/collection/hasret",
    "/collection/sinema",
    "/contact",
    "/shipping",
    "/returns",
    "/support",
    "/privacy",
    "/terms",
] as const;

export const isStaticPage = (path: string | null): path is (typeof STATIC_PAGES)[number] =>
    path !== null && (STATIC_PAGES as readonly string[]).includes(path);
