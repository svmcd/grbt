import { getTestShippingPrice } from "./dev-mode";

export type ShippingCountry = {
    code: string;
    name: string;
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
