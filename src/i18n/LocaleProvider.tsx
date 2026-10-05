"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, intlLocales, type Locale } from "./config";
import type { Messages } from "./define";

type LocaleContextType = {
    locale: Locale;
    intlLocale: string;
    setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const router = useRouter();

    const setLocale = useCallback(
        (next: Locale) => {
            document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
            document.documentElement.lang = next;
            setLocaleState(next);
            // Re-render server components (metadata, server-rendered text) in the new language
            router.refresh();
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
