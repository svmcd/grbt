import type Stripe from "stripe";
import { intlLocales, type Locale } from "@/i18n/config";

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

export const SHIPPING_COUNTRY_CODES: string[] = STRIPE_SHIPPING_COUNTRIES;

// Shown first in the cart's country picker
export const POPULAR_SHIPPING_COUNTRIES = ["NL", "DE", "BE", "FR", "AT", "CH", "GB", "US", "TR"];

// The 27 EU member states
const EU_COUNTRY_CODES = new Set([
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
    "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

export function isShippingCountry(code: unknown): code is AllowedCountry {
    return typeof code === "string" && SHIPPING_COUNTRY_CODES.includes(code);
}

export function isEU(code: string): boolean {
    return EU_COUNTRY_CODES.has(code.toUpperCase());
}

// Delivery time in business days after dispatch, as stated in the shipping policy:
// Netherlands 1-3, EU 3-7, everywhere else 7-14.
export function deliveryDays(countryCode: string): { min: number; max: number } {
    const code = countryCode.toUpperCase();
    if (code === "NL") return { min: 1, max: 3 };
    if (isEU(code)) return { min: 3, max: 7 };
    return { min: 7, max: 14 };
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
