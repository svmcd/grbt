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
            return { lang: tag.toLowerCase().split("-")[0], q: q ? parseFloat(q) : 1 };
        })
        .sort((a, b) => b.q - a.q);
    for (const { lang } of ranked) {
        if (isLocale(lang)) return lang;
    }
    return defaultLocale;
}

export function resolveLocale(value: unknown): Locale {
    return isLocale(value) ? value : defaultLocale;
}
