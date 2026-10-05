"use client";

import { useEffect, useState } from "react";
import { AdminApiError, adminFetch } from "@/lib/admin/client";

// Shape of GET /api/admin/traffic (store behaviour tracking)
export type TrafficDay = {
    date: string; // YYYY-MM-DD
    visitors: number;
    pageviews: number;
    productViewers: number;
    cartVisitors: number;
    checkoutVisitors: number;
    purchasers: number;
    productViews: number;
    addToCart: number;
    removeFromCart: number;
    checkouts: number;
    purchases: number;
    revenue: number; // cents
};
export type TrafficTotals = Omit<TrafficDay, "date">;
export type TrafficData = {
    since: string | null;
    days: TrafficDay[];
    totals: TrafficTotals;
    products: { slug: string; title: string; views: number; addToCart: number; purchases: number }[];
    sources: { source: string; visitors: number }[];
    countries: { country: string; visitors: number }[];
    devices: { device: string; visitors: number }[];
    languages: { language: string; visitors: number }[];
    pages: { path: string; views: number }[];
};

export type TrafficDays = 7 | 30 | 90 | 365;
type State = { status: "loading" | "ready" | "missing" | "error"; data: TrafficData | null; error?: string };

const cache = new Map<TrafficDays, TrafficData | null>();

export const TOTAL_KEYS: (keyof TrafficTotals)[] = [
    "visitors",
    "pageviews",
    "productViewers",
    "cartVisitors",
    "checkoutVisitors",
    "purchasers",
    "productViews",
    "addToCart",
    "removeFromCart",
    "checkouts",
    "purchases",
    "revenue",
];

export function sumDays(days: TrafficDay[]): TrafficTotals {
    const t = Object.fromEntries(TOTAL_KEYS.map((k) => [k, 0])) as TrafficTotals;
    for (const d of days) for (const k of TOTAL_KEYS) t[k] += Number(d[k]) || 0;
    return t;
}

// "missing": the API is not there yet (404) or there is no data; pages show the empty state
export function useTraffic(days: TrafficDays): State {
    const [state, setState] = useState<State>(() =>
        cache.has(days) ? { status: cache.get(days) ? "ready" : "missing", data: cache.get(days) ?? null } : { status: "loading", data: null },
    );
    useEffect(() => {
        if (cache.has(days)) {
            const data = cache.get(days) ?? null;
            setState({ status: data ? "ready" : "missing", data });
            return;
        }
        let cancelled = false;
        setState({ status: "loading", data: null });
        adminFetch<TrafficData>(`/api/admin/traffic?days=${days}`)
            .then((data) => {
                const ok = data && data.since ? data : null;
                if (ok) cache.set(days, ok); // no data yet: ask again next time
                if (!cancelled) setState({ status: ok ? "ready" : "missing", data: ok });
            })
            .catch((e) => {
                if (cancelled) return;
                if (e instanceof AdminApiError && e.status === 404) {
                    setState({ status: "missing", data: null });
                    return;
                }
                setState({ status: "error", data: null, error: e instanceof Error ? e.message : "Could not load traffic" });
            });
        return () => {
            cancelled = true;
        };
    }, [days]);
    return state;
}
