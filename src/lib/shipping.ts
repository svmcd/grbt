import type Stripe from "stripe";
import { intlLocales, type Locale } from "@/i18n/config";
import cloprodShipping from "@/data/cloprod-shipping.json";

// Shipping rules: one standard rate for every destination, free from a threshold on the items.
export const STANDARD_SHIPPING_EUR = 8;
export const FREE_SHIPPING_FROM_EUR = 100;

type AllowedCountry = Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;

// Every country Stripe Checkout accepts in shipping_address_collection.allowed_countries
// (the AllowedCountry union in node_modules/stripe, v19.1.0). "ZZ" (unknown region) is left out:
// it is not a destination a customer can pick.
const STRIPE_SHIPPING_COUNTRIES: AllowedCountry[] = [
    "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ",
    "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
    "BT", "BV", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO",
    "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER",
    "ES", "ET", "FI", "FJ", "FK", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL",
    "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID",
    "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI",
    "KM", "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV",
    "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT",
    "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU",
    "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY", "QA",
    "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL",
    "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ",
    "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA",
    "VC", "VE", "VG", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW",
];

// Transit time per destination, in business days, from Cloprod's shipping list
// (src/data/cloprod-shipping.json: the fastest channel Cloprod offers for each country).
// Cloprod makes and ships every order; a country missing from that list cannot be delivered to.
const TRANSIT_DAYS = new Map<string, { min: number; max: number }>(
    (cloprodShipping as { code: string; days: string }[]).map(({ code, days }) => {
        const [min, max] = days.split("-").map(Number);
        return [code, { min, max: max ?? min }];
    })
);

// Countries the cart, /api/checkout and Stripe offer: those Stripe accepts and Cloprod delivers to
export const SHIPPING_COUNTRY_CODES: AllowedCountry[] = STRIPE_SHIPPING_COUNTRIES.filter((code) => TRANSIT_DAYS.has(code));

// Shown first in the cart's country picker
export const POPULAR_SHIPPING_COUNTRIES = ["NL", "DE", "BE", "FR", "AT", "CH", "GB", "US"];

// The 27 EU member states
const EU_COUNTRY_CODES = new Set([
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
    "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

export function isShippingCountry(code: unknown): code is AllowedCountry {
    return typeof code === "string" && (SHIPPING_COUNTRY_CODES as string[]).includes(code);
}

export function isEU(code: string): boolean {
    return EU_COUNTRY_CODES.has(code.toUpperCase());
}

// Production time at Cloprod, in business days (Cloprod's stated production time)
export const PRODUCTION_DAYS = { min: 1, max: 3 };

// Transit time to a country in business days, null when Cloprod does not deliver there
export function transitDays(countryCode: string): { min: number; max: number } | null {
    return TRANSIT_DAYS.get(countryCode.toUpperCase()) ?? null;
}

// Delivery time in business days from the order: production plus transit.
// Null for a country we cannot ship to.
export function deliveryDays(countryCode: string): { min: number; max: number } | null {
    const transit = transitDays(countryCode);
    if (!transit) return null;
    return { min: PRODUCTION_DAYS.min + transit.min, max: PRODUCTION_DAYS.max + transit.max };
}

// The date `days` business days (Monday to Friday) after `from`. An order placed on a weekend
// counts its first business day from Monday. Public holidays are not taken into account.
export function addBusinessDays(from: Date, days: number): Date {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    let left = days;
    while (left > 0) {
        date.setDate(date.getDate() + 1);
        const weekday = date.getDay();
        if (weekday !== 0 && weekday !== 6) left--;
    }
    return date;
}

export type DeliveryTimeline = {
    ordered: Date;
    shipped: { from: Date; to: Date }; // end of production: handed to the carrier
    delivered: { from: Date; to: Date };
};

// Dates for an order placed on `ordered`, from the same business days as deliveryDays()
export function deliveryTimeline(countryCode: string, ordered: Date = new Date()): DeliveryTimeline | null {
    const days = deliveryDays(countryCode);
    if (!days) return null;
    return {
        ordered,
        shipped: { from: addBusinessDays(ordered, PRODUCTION_DAYS.min), to: addBusinessDays(ordered, PRODUCTION_DAYS.max) },
        delivered: { from: addBusinessDays(ordered, days.min), to: addBusinessDays(ordered, days.max) },
    };
}

// "Thu 9 Oct" in the visitor's language
export function formatDeliveryDate(date: Date, intlLocale: string): string {
    return new Intl.DateTimeFormat(intlLocale, { weekday: "short", day: "numeric", month: "short" }).format(date);
}

// "Tue 7 – Thu 9 Oct": a date range in the visitor's language (one date when both are the same day)
export function formatDeliveryRange(from: Date, to: Date, intlLocale: string): string {
    const format = new Intl.DateTimeFormat(intlLocale, { weekday: "short", day: "numeric", month: "short" });
    if (from.getTime() === to.getTime()) return format.format(from);
    return typeof format.formatRange === "function"
        ? format.formatRange(from, to)
        : `${format.format(from)} - ${format.format(to)}`;
}

// Shipping for an order, in cents. The free-shipping threshold is measured on the items
// subtotal before discounts (the cart has always worked this way).
export function shippingCents(itemsSubtotalCents: number): number {
    return itemsSubtotalCents >= FREE_SHIPPING_FROM_EUR * 100 ? 0 : STANDARD_SHIPPING_EUR * 100;
}

// Kept for the admin "Create order" form, which lists the countries by code.
export const shippingCountries: { code: string }[] = SHIPPING_COUNTRY_CODES.map((code) => ({ code }));

// Display name of a country in the visitor's language
export function getCountryName(countryCode: string, locale: Locale): string {
    try {
        const name = new Intl.DisplayNames([intlLocales[locale]], { type: "region" }).of(countryCode);
        if (name) return name;
    } catch {
        // Fall through to the code
    }
    return countryCode;
}
