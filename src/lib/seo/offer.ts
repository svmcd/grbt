import { FREE_SHIPPING_FROM_EUR, STANDARD_SHIPPING_EUR, deliveryDays } from "@/lib/shipping";

// The 27 EU member states: the returns policy grants them the 60-day right of withdrawal
const EU_COUNTRIES = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
    "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
];

// Shipping is worldwide at one rate. schema.org needs explicit countries, so the
// structured data names the EU plus the main markets outside it.
const SHIPPING_MARKETS = [...EU_COUNTRIES, "CH", "GB", "US", "TR"];

const days = (min: number, max: number) => ({ "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" });

// schema.org OfferShippingDetails, one entry per delivery-time band (NL, EU, rest)
export function shippingDetails(priceEur: number) {
    const bands = new Map<string, { min: number; max: number; countries: string[] }>();
    for (const code of SHIPPING_MARKETS) {
        const { min, max } = deliveryDays(code);
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
            handlingTime: days(1, 3),
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
