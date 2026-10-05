import { getTestShippingPrice } from "./dev-mode";
import { intlLocales, type Locale } from "@/i18n/config";

export type ShippingCountry = {
    code: string;
    name: string; // Native name, kept as stored/fallback value. Use getCountryName() for display.
    price: number;
    currency: string;
    estimatedDays: string;
};

// Shipping prices (2024)
export const shippingCountries: ShippingCountry[] = [
    {
        code: "NL",
        name: "Nederland",
        price: 5,
        currency: "EUR",
        estimatedDays: "1-2 days"
    },
    {
        code: "DE",
        name: "Deutschland",
        price: 10,
        currency: "EUR",
        estimatedDays: "2-3 days"
    },
    {
        code: "FR",
        name: "France",
        price: 10,
        currency: "EUR",
        estimatedDays: "2-3 days"
    },
    {
        code: "CH",
        name: "Schweiz",
        price: 10,
        currency: "EUR",
        estimatedDays: "3-5 days"
    },
    {
        code: "AT",
        name: "Österreich",
        price: 10,
        currency: "EUR",
        estimatedDays: "2-3 days"
    },
    {
        code: "GB",
        name: "United Kingdom",
        price: 10,
        currency: "EUR",
        estimatedDays: "3-5 days"
    },
    {
        code: "US",
        name: "United States",
        price: 10,
        currency: "EUR",
        estimatedDays: "5-7 days"
    },
    {
        code: "BE",
        name: "België",
        price: 10,
        currency: "EUR",
        estimatedDays: "1-2 days"
    }
];

export function getShippingPrice(countryCode: string): number {
    const country = shippingCountries.find(c => c.code === countryCode);
    const price = country?.price || 0;

    // Apply test mode pricing in development
    return getTestShippingPrice(price);
}

export function getShippingCountry(countryCode: string): ShippingCountry | undefined {
    return shippingCountries.find(c => c.code === countryCode);
}

export function getAllShippingCountries(): ShippingCountry[] {
    return shippingCountries;
}


// Fallback names when Intl.DisplayNames is unavailable
const countryNames: Record<Locale, Record<string, string>> = {
    en: { NL: "Netherlands", DE: "Germany", FR: "France", CH: "Switzerland", AT: "Austria", GB: "United Kingdom", US: "United States", BE: "Belgium" },
    de: { NL: "Niederlande", DE: "Deutschland", FR: "Frankreich", CH: "Schweiz", AT: "Österreich", GB: "Vereinigtes Königreich", US: "Vereinigte Staaten", BE: "Belgien" },
    fr: { NL: "Pays-Bas", DE: "Allemagne", FR: "France", CH: "Suisse", AT: "Autriche", GB: "Royaume-Uni", US: "États-Unis", BE: "Belgique" },
    tr: { NL: "Hollanda", DE: "Almanya", FR: "Fransa", CH: "İsviçre", AT: "Avusturya", GB: "Birleşik Krallık", US: "Amerika Birleşik Devletleri", BE: "Belçika" },
};

// Display name of a shipping country in the visitor's language
export function getCountryName(countryCode: string, locale: Locale): string {
    const mapped = countryNames[locale]?.[countryCode];
    if (mapped) return mapped;
    try {
        const name = new Intl.DisplayNames([intlLocales[locale]], { type: "region" }).of(countryCode);
        if (name) return name;
    } catch {
        // Fall through to the stored name
    }
    return getShippingCountry(countryCode)?.name ?? countryCode;
}
