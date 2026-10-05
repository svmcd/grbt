"use client";

// Cookieless store analytics: sends events to /api/t on the live site only.
// Nothing is stored in the browser except the "internal" flag for the shop's own devices.

type Payload = {
    path?: string;
    slug?: string;
    quantity?: number;
    value?: number; // cents
    referrer?: string;
    utmSource?: string;
};

const INTERNAL_KEY = "egk-internal";

export function markInternalDevice() {
    try {
        localStorage.setItem(INTERNAL_KEY, "1");
    } catch {
        // storage blocked: nothing to do
    }
}

function enabled() {
    if (typeof window === "undefined") return false;
    if (!/(^|\.)egrikuyu\.com$/.test(window.location.hostname)) return false;
    if (window.location.pathname.startsWith("/admin")) return false;
    try {
        return localStorage.getItem(INTERNAL_KEY) !== "1";
    } catch {
        return true;
    }
}

export function track(event: "page_view" | "product_view" | "add_to_cart" | "remove_from_cart" | "begin_checkout", data: Payload = {}) {
    if (!enabled()) return;
    const body = JSON.stringify({ event, ...data });
    try {
        if (navigator.sendBeacon?.("/api/t", new Blob([body], { type: "application/json" }))) return;
    } catch {
        // fall back to fetch
    }
    fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}
