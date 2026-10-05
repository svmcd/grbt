import { FREE_SHIPPING_FROM_EUR, PRODUCTION_DAYS, SHIPPING_COUNTRY_CODES, STANDARD_SHIPPING_EUR, transitDays } from "@/lib/shipping";

// The 27 EU member states: the returns policy grants them the 60-day right of withdrawal
const EU_COUNTRIES = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
    "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
];

// One rate for every country we ship to (Stripe and Cloprod both support it)
const SHIPPING_MARKETS = SHIPPING_COUNTRY_CODES;

const days = (min: number, max: number) => ({ "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" });

// schema.org OfferShippingDetails, one entry per transit-time band (Cloprod's days per country);
// handling time is the production time
export function shippingDetails(priceEur: number) {
    const bands = new Map<string, { min: number; max: number; countries: string[] }>();
    for (const code of SHIPPING_MARKETS) {
        const transit = transitDays(code);
        if (!transit) continue;
        const { min, max } = transit;
        const key = `${min}-${max}`;
        const band = bands.get(key) ?? { min, max, countries: [] };
        band.countries.push(code);
        bands.set(key, band);
    }
    const rate = priceEur >= FREE_SHIPPING_FROM_EUR ? 0 : STANDARD_SHIPPING_EUR;
    return [...bands.values()].map((band) => ({
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: rate, currency: "EUR" },
        shippingDestination: band.countries.map((addressCountry) => ({ "@type": "DefinedRegion", addressCountry })),
        deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: days(PRODUCTION_DAYS.min, PRODUCTION_DAYS.max),
            transitTime: days(band.min, band.max),
        },
    }));
}

// 60-day right of withdrawal, returned by mail, the customer pays the return shipping
export const merchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: EU_COUNTRIES,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 60,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
};
