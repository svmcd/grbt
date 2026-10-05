"use client";

import { useEffect, useState } from "react";
import { isShippingCountry } from "@/lib/shipping";

// The visitor's shipping country, shared by the cart and the product page:
// the last country chosen in the cart on this device, otherwise the country from /api/geo.

export const COUNTRY_STORAGE_KEY = "shippingCountry";
// Fired on window when the cart's country changes, so the product page follows it
export const COUNTRY_CHANGE_EVENT = "shipping-country-change";

export type GeoResult = { country: string | null; detected: string | null };

// One /api/geo request per page load, shared by every caller
let geoRequest: Promise<GeoResult> | null = null;
export function fetchGeo(): Promise<GeoResult> {
    if (!geoRequest) {
        geoRequest = fetch("/api/geo")
            .then((res) => (res.ok ? res.json() : null))
            .then((data: Partial<GeoResult> | null) => ({
                country: isShippingCountry(data?.country) ? data.country : null,
                detected: typeof data?.detected === "string" ? data.detected : null,
            }))
            .catch(() => ({ country: null, detected: null }));
    }
    return geoRequest;
}

export function readStoredCountry(): string | null {
    try {
        const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
        return isShippingCountry(stored) ? stored : null;
    } catch {
        // Storage blocked
        return null;
    }
}

export function storeCountry(code: string) {
    try {
        localStorage.setItem(COUNTRY_STORAGE_KEY, code);
    } catch {
        // Not remembered, still used for this visit
    }
    window.dispatchEvent(new CustomEvent(COUNTRY_CHANGE_EVENT, { detail: code }));
}

export type VisitorCountry =
    | { status: "loading" }
    // A country we ship to (chosen in the cart or detected)
    | { status: "supported"; country: string }
    // Detected, but not a country we ship to
    | { status: "unsupported"; country: string }
    | { status: "unknown" };

// Resolved after mount only, so server and client render the same first HTML
export function useVisitorCountry(): VisitorCountry {
    const [state, setState] = useState<VisitorCountry>({ status: "loading" });

    useEffect(() => {
        let cancelled = false;
        const stored = readStoredCountry();
        if (stored) setState({ status: "supported", country: stored });
        else
            fetchGeo().then(({ country, detected }) => {
                if (cancelled) return;
                // A choice made in the cart meanwhile wins
                const chosen = readStoredCountry();
                if (chosen) setState({ status: "supported", country: chosen });
                else if (country) setState({ status: "supported", country });
                else if (detected) setState({ status: "unsupported", country: detected });
                else setState({ status: "unknown" });
            });

        const onChange = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            if (isShippingCountry(code)) setState({ status: "supported", country: code });
        };
        const onStorage = (e: StorageEvent) => {
            if (e.key === COUNTRY_STORAGE_KEY && isShippingCountry(e.newValue)) {
                setState({ status: "supported", country: e.newValue });
            }
        };
        window.addEventListener(COUNTRY_CHANGE_EVENT, onChange);
        window.addEventListener("storage", onStorage);
        return () => {
            cancelled = true;
            window.removeEventListener(COUNTRY_CHANGE_EVENT, onChange);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    return state;
}
