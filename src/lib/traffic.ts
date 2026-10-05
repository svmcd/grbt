import crypto from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

// First-party, cookieless store analytics (Plausible style). A visitor is an anonymous hash of
// (secret, day, IP, user agent) that changes every day; IP addresses are never stored.
// Stored as one counter document per day (traffic_daily/{YYYY-MM-DD}) plus a small per-visitor
// document per day for unique counts and the funnel stages.

export const TRACK_EVENTS = ["page_view", "product_view", "add_to_cart", "remove_from_cart", "begin_checkout"] as const;
export type TrackEvent = (typeof TRACK_EVENTS)[number] | "purchase";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|discord|vercel|monitor|curl|wget|python|axios|node-fetch/i;
const MAX_EVENTS_PER_VISITOR_DAY = 500;

const secret = () => process.env.ANALYTICS_SECRET || process.env.FIREBASE_PRIVATE_KEY || "egrikuyu";
export const today = () => new Date().toISOString().slice(0, 10);

export function isBot(userAgent: string | null) {
    return !userAgent || BOT.test(userAgent);
}

export function clientIp(headers: Headers) {
    return (headers.get("x-forwarded-for") || "").split(",")[0].trim() || headers.get("x-real-ip") || "";
}

export function visitorHash(headers: Headers, day = today()) {
    return crypto
        .createHash("sha256")
        .update(`${secret()}|${day}|${clientIp(headers)}|${headers.get("user-agent") || ""}`)
        .digest("hex")
        .slice(0, 32);
}

function device(userAgent: string) {
    if (/ipad|tablet/i.test(userAgent)) return "Tablet";
    if (/mobi|iphone|android/i.test(userAgent)) return "Mobile";
    return "Desktop";
}

const SOURCES: [RegExp, string][] = [
    [/instagram/, "Instagram"],
    [/tiktok/, "TikTok"],
    [/facebook|fb\.|messenger/, "Facebook"],
    [/google\./, "Google"],
    [/bing\./, "Bing"],
    [/duckduckgo/, "DuckDuckGo"],
    [/youtube|youtu\.be/, "YouTube"],
    [/pinterest/, "Pinterest"],
    [/t\.co$|twitter|x\.com/, "X"],
    [/snapchat/, "Snapchat"],
    [/whatsapp/, "WhatsApp"],
];

export function trafficSource(referrer: string | undefined, utmSource: string | undefined) {
    if (utmSource) return utmSource.slice(0, 40).toLowerCase();
    if (!referrer) return "Direct";
    try {
        const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
        if (host.endsWith("egrikuyu.com") || host.endsWith("grbt.studio")) return "Direct";
        for (const [re, name] of SOURCES) if (re.test(host)) return name;
        return host.slice(0, 60);
    } catch {
        return "Direct";
    }
}

export type TrackInput = {
    event: TrackEvent;
    path?: string;
    slug?: string;
    quantity?: number;
    value?: number; // cents
    slugs?: { slug: string; quantity: number }[]; // purchase / checkout items
    referrer?: string;
    utmSource?: string;
    locale?: string;
};

type Visitor = {
    hash: string;
    day: string;
    country: string;
    device: string;
};

// Map keys: URL-encoded (no "/" or ".") so paths and slugs round-trip exactly
const key = (s: string) => encodeURIComponent(s.slice(0, 120)).replace(/\./g, "%2E") || "_";
const unkey = (s: string) => {
    try {
        return decodeURIComponent(s);
    } catch {
        return s;
    }
};

export async function recordEvent(input: TrackInput, visitor: Visitor) {
    const dayRef = adminDb.collection("traffic_daily").doc(visitor.day);
    const visitorRef = dayRef.collection("visitors").doc(visitor.hash);

    await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(visitorRef);
        const v = snap.exists ? (snap.data() as { events?: number; stages?: Record<string, boolean> }) : null;
        if (v && (v.events || 0) >= MAX_EVENTS_PER_VISITOR_DAY) return;

        const inc = (n = 1) => FieldValue.increment(n);
        const day: Record<string, unknown> = { date: visitor.day };
        const stages = { ...(v?.stages || {}) };

        if (!v && input.event !== "purchase") {
            const source = trafficSource(input.referrer, input.utmSource);
            day.visitors = inc();
            day.sources = { [key(source)]: inc() };
            day.countries = { [visitor.country || "Unknown"]: inc() };
            day.devices = { [visitor.device]: inc() };
            day.languages = { [input.locale || "unknown"]: inc() };
        }

        const stage = (name: string, counter: string) => {
            if (!stages[name]) {
                stages[name] = true;
                day[counter] = inc();
            }
        };

        switch (input.event) {
            case "page_view":
                day.pageviews = inc();
                if (input.path) day.pages = { [key(input.path)]: inc() };
                break;
            case "product_view":
                day.productViews = inc();
                if (input.slug) day.products = { [key(input.slug)]: { views: inc() } };
                stage("product", "productViewers");
                break;
            case "add_to_cart":
                day.addToCart = inc(input.quantity || 1);
                if (input.slug) day.products = { [key(input.slug)]: { addToCart: inc(input.quantity || 1) } };
                stage("cart", "cartVisitors");
                break;
            case "remove_from_cart":
                day.removeFromCart = inc();
                break;
            case "begin_checkout":
                day.checkouts = inc();
                stage("checkout", "checkoutVisitors");
                break;
            case "purchase":
                day.purchases = inc();
                day.revenue = inc(Math.round(input.value || 0));
                if (input.slugs?.length) {
                    const products: Record<string, unknown> = {};
                    for (const s of input.slugs) products[key(s.slug)] = { purchases: inc(s.quantity || 1) };
                    day.products = products;
                }
                if (v) stage("purchase", "purchasers");
                break;
        }

        tx.set(dayRef, day, { merge: true });
        if (v || input.event !== "purchase") {
            tx.set(
                visitorRef,
                {
                    stages,
                    events: FieldValue.increment(1),
                    ...(v ? {} : { firstSeen: new Date().toISOString(), country: visitor.country, device: visitor.device }),
                },
                { merge: true }
            );
        }
    });
}

export function visitorFromRequest(headers: Headers): Visitor | null {
    const ua = headers.get("user-agent");
    if (isBot(ua)) return null;
    return {
        hash: visitorHash(headers),
        day: today(),
        country: (headers.get("x-vercel-ip-country") || "").toUpperCase(),
        device: device(ua || ""),
    };
}

// ---- Reading (admin) ----

type Counter = Record<string, number>;
export type TrafficDay = {
    date: string;
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
    revenue: number;
};
const NUMERIC: (keyof Omit<TrafficDay, "date">)[] = [
    "visitors", "pageviews", "productViewers", "cartVisitors", "checkoutVisitors", "purchasers",
    "productViews", "addToCart", "removeFromCart", "checkouts", "purchases", "revenue",
];

export async function readTraffic(days: number, titleFor: (slug: string) => string) {
    const from = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
    const snap = await adminDb.collection("traffic_daily").where("date", ">=", from).orderBy("date").get();
    const first = await adminDb.collection("traffic_daily").orderBy("date").limit(1).get();

    const totals = Object.fromEntries(NUMERIC.map((k) => [k, 0])) as Omit<TrafficDay, "date">;
    const merge = (target: Counter, src: Counter | undefined) => {
        for (const [k, n] of Object.entries(src || {})) target[k] = (target[k] || 0) + (Number(n) || 0);
    };
    const sources: Counter = {}, countries: Counter = {}, devices: Counter = {}, languages: Counter = {}, pages: Counter = {};
    const products: Record<string, { views: number; addToCart: number; purchases: number }> = {};

    const byDate = new Map<string, TrafficDay>();
    snap.forEach((d) => {
        const x = d.data();
        const row = { date: x.date } as TrafficDay;
        for (const k of NUMERIC) {
            row[k] = Number(x[k]) || 0;
            totals[k] += row[k];
        }
        byDate.set(x.date, row);
        merge(sources, x.sources);
        merge(countries, x.countries);
        merge(devices, x.devices);
        merge(languages, x.languages);
        merge(pages, x.pages);
        for (const [slug, p] of Object.entries((x.products || {}) as Record<string, Counter>)) {
            const t = (products[slug] ||= { views: 0, addToCart: 0, purchases: 0 });
            t.views += Number(p.views) || 0;
            t.addToCart += Number(p.addToCart) || 0;
            t.purchases += Number(p.purchases) || 0;
        }
    });

    // One row per calendar day so charts have no gaps
    const daysOut: TrafficDay[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        daysOut.push(byDate.get(date) || ({ date, ...Object.fromEntries(NUMERIC.map((k) => [k, 0])) } as TrafficDay));
    }
    const list = (c: Counter, name: string) =>
        Object.entries(c)
            .map(([k, n]) => ({ [name]: unkey(k), visitors: n }))
            .sort((a, b) => (b.visitors as number) - (a.visitors as number));

    return {
        since: first.empty ? null : (first.docs[0].data().date as string),
        days: daysOut,
        totals,
        products: Object.entries(products)
            .map(([k, p]) => ({ slug: unkey(k), title: titleFor(unkey(k)), ...p }))
            .sort((a, b) => b.views - a.views),
        sources: list(sources, "source"),
        countries: list(countries, "country"),
        devices: list(devices, "device"),
        languages: list(languages, "language"),
        pages: Object.entries(pages)
            .map(([path, views]) => ({ path: unkey(path), views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 30),
    };
}
