"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, intlLocales, localizePath, splitLocalePrefix, type Locale } from "./config";
import type { Messages } from "./define";

type LocaleContextType = {
    locale: Locale;
    intlLocale: string;
    setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
    // Seeded from the server-resolved locale (URL prefix, then cookie). Follows the
    // server when the root layout re-renders with another locale (router.refresh).
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const [seed, setSeed] = useState<Locale>(initialLocale);
    if (seed !== initialLocale) {
        setSeed(initialLocale);
        setLocaleState(initialLocale);
    }
    const router = useRouter();

    const setLocale = useCallback(
        (next: Locale) => {
            document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
            document.documentElement.lang = next;
            setLocaleState(next);
            // Move to the same page's URL in the new language (/tr/…, English unprefixed); the
            // navigation re-renders the page and its metadata. Same URL (unprefixed page, language
            // from the cookie): re-render server components in place.
            const { pathname, search, hash } = window.location;
            const target = localizePath(pathname, next);
            if (target !== pathname) router.push(target + search + hash, { scroll: false });
            else router.refresh();
        },
        [router]
    );

    return (
        <LocaleContext.Provider value={{ locale, intlLocale: intlLocales[locale], setLocale }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) throw new Error("useLocale must be used within a LocaleProvider");
    return context;
}

// The current path without its language prefix: "/tr/collection/hasret" → "/collection/hasret".
// Use this instead of usePathname() when comparing against routes (home, active nav link).
export function usePlainPathname(): string {
    return splitLocalePrefix(usePathname() ?? "/").path;
}

// Internal link in the URL's language: on /tr/… pages, href("/shipping") is "/tr/shipping";
// on unprefixed pages links stay unprefixed (the cookie carries the language).
export function useLocalizedHref() {
    const urlLocale = splitLocalePrefix(usePathname() ?? "/").locale;
    return useCallback((path: string) => (urlLocale ? localizePath(path, urlLocale) : path), [urlLocale]);
}

// Euro amounts in the visitor's number format: "€40" (tr/en), "40 €" (de/fr).
// Whole amounts drop the decimals unless `decimals` is given.
export function useFormatPrice() {
    const { intlLocale } = useLocale();
    return useCallback(
        (euros: number, decimals?: number) => {
            const digits = decimals ?? (Number.isInteger(euros) ? 0 : 2);
            return new Intl.NumberFormat(intlLocale, {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
            }).format(euros);
        },
        [intlLocale]
    );
}

// const t = useMessages(headerMessages); t.home
export function useMessages<T>(messages: Messages<T>): T {
    return messages[useLocale().locale];
}
