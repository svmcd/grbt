// Display helpers for the admin (English only).

export function money(cents: number, opts: { compact?: boolean } = {}) {
    const euros = (cents || 0) / 100;
    if (opts.compact && Math.abs(euros) >= 1000) {
        return `€${(euros / 1000).toLocaleString("en-GB", { maximumFractionDigits: 1 })}k`;
    }
    return euros.toLocaleString("en-GB", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
}

// Whole euros for chart axes
export function moneyShort(cents: number) {
    const euros = (cents || 0) / 100;
    if (Math.abs(euros) >= 1000) return `€${(euros / 1000).toLocaleString("en-GB", { maximumFractionDigits: 1 })}k`;
    return `€${Math.round(euros).toLocaleString("en-GB")}`;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const shortDateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

const toDate = (v: number | string | Date) => (v instanceof Date ? v : typeof v === "number" ? new Date(v * 1000) : new Date(v));

// Unix seconds, ISO strings or Dates
export const formatDate = (v: number | string | Date) => dateFmt.format(toDate(v));
export const formatDateTime = (v: number | string | Date) => dateTimeFmt.format(toDate(v));
export const formatShortDate = (v: number | string | Date) => shortDateFmt.format(toDate(v));

// "Today 14:05", "Yesterday", "3 Sep" (this year) or "3 Sep 2025"
export function formatOrderDate(seconds: number) {
    const d = new Date(seconds * 1000);
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (d.getTime() >= startToday) return `Today at ${time}`;
    if (d.getTime() >= startToday - 86400000) return `Yesterday at ${time}`;
    if (d.getFullYear() === now.getFullYear()) return shortDateFmt.format(d);
    return dateFmt.format(d);
}

export function timeAgo(iso: string | null | undefined, now = Date.now()) {
    if (!iso) return "never";
    const diff = Math.max(0, now - new Date(iso).getTime());
    const min = Math.floor(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min} min ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
}

export const daysSince = (seconds: number, now = Date.now()) => Math.floor((now - seconds * 1000) / 86400000);

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
export function countryName(code: string) {
    if (!code) return "Unknown";
    try {
        return regionNames?.of(code.toUpperCase()) || code;
    } catch {
        return code;
    }
}

const LANGUAGES: Record<string, string> = { tr: "Turkish", en: "English", de: "German", fr: "French", nl: "Dutch" };
export const languageName = (code: string) => LANGUAGES[code] || code || "Unknown";

export const plural = (n: number, word: string, many = `${word}s`) => `${n.toLocaleString("en-GB")} ${n === 1 ? word : many}`;

export function percent(part: number, whole: number, digits = 0) {
    if (!whole) return "0%";
    return `${((part / whole) * 100).toFixed(digits)}%`;
}
