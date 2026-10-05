export const locales = ["en", "de", "fr", "tr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, string> = {
    en: "English",
    de: "Deutsch",
    fr: "Français",
    tr: "Türkçe",
};

// BCP 47 tags for Intl date/number formatting
export const intlLocales: Record<Locale, string> = {
    en: "en-GB",
    de: "de-DE",
    fr: "fr-FR",
    tr: "tr-TR",
};

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (locales as readonly string[]).includes(value);
}

// Picks the best supported locale from an Accept-Language header
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
    if (!acceptLanguage) return defaultLocale;
    const ranked = acceptLanguage
        .split(",")
        .map((part) => {
            const [tag, q] = part.trim().split(";q=");
            const weight = q === undefined ? 1 : parseFloat(q);
            return { lang: tag.toLowerCase().split("-")[0], q: Number.isFinite(weight) ? weight : 0 };
        })
        // q=0 means "not acceptable"
        .filter(({ q }) => q > 0)
        .sort((a, b) => b.q - a.q);
    for (const { lang } of ranked) {
        if (isLocale(lang)) return lang;
    }
    return defaultLocale;
}

export function resolveLocale(value: unknown): Locale {
    return isLocale(value) ? value : defaultLocale;
}

// Locale-prefixed URLs: /de/…, /fr/…, /tr/… serve the same pages in that language.
// English has no prefix. The middleware strips the prefix, rewrites to the plain
// route and passes the locale on in this request header (read by getLocale()).
export const LOCALE_HEADER = "x-locale";
// The request path without its locale prefix ("/product/konya"), set by the middleware
export const PATH_HEADER = "x-pathname";

const PREFIX_RE = /^\/(en|de|fr|tr)(?=\/|$)/;

// "/tr/product/konya" → { locale: "tr", path: "/product/konya" }; "/shipping" → { locale: null, path: "/shipping" }
export function splitLocalePrefix(pathname: string): { locale: Locale | null; path: string } {
    const match = PREFIX_RE.exec(pathname);
    if (!match) return { locale: null, path: pathname || "/" };
    return { locale: match[1] as Locale, path: pathname.slice(match[0].length) || "/" };
}

// Paths that only exist once, without a language prefix: back office, API, files, feeds
export function isLocalizablePath(path: string): boolean {
    if (/^\/(admin|api|_next)(\/|$)/.test(path)) return false;
    const last = path.slice(path.lastIndexOf("/") + 1);
    return !last.includes(".");
}

// The URL path of `path` in `locale`: English unprefixed, the others prefixed
export function localizePath(path: string, locale: Locale): string {
    const plain = splitLocalePrefix(path).path;
    if (locale === defaultLocale || !isLocalizablePath(plain)) return plain;
    return plain === "/" ? `/${locale}` : `/${locale}${plain}`;
}
