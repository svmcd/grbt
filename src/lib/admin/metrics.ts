// Everything the admin reports is computed here from the normalized orders. Nothing is estimated.
import type { AdminOrder } from "./orders";

export type PeriodKey = "today" | "7d" | "30d" | "90d" | "12m" | "all";

export const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7 days" },
    { key: "30d", label: "Last 30 days" },
    { key: "90d", label: "Last 90 days" },
    { key: "12m", label: "Last 12 months" },
    { key: "all", label: "All time" },
];

export const isPeriodKey = (v: unknown): v is PeriodKey => PERIODS.some((p) => p.key === v);

export type Range = { start: number; end: number }; // ms, [start, end)

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// The period and the same-length window right before it (null for "All time").
export function periodRange(key: PeriodKey, orders: AdminOrder[], now = new Date()): { current: Range; previous: Range | null } {
    const end = now.getTime();
    const today = startOfDay(now);
    let start: number;
    switch (key) {
        case "today":
            start = today.getTime();
            break;
        case "7d":
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).getTime();
            break;
        case "30d":
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29).getTime();
            break;
        case "90d":
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89).getTime();
            break;
        case "12m":
            start = new Date(today.getFullYear(), today.getMonth() - 11, 1).getTime();
            break;
        case "all": {
            const first = orders.reduce((m, o) => Math.min(m, o.created * 1000), end);
            const d = new Date(first);
            return { current: { start: new Date(d.getFullYear(), d.getMonth(), 1).getTime(), end: end + 1 }, previous: null };
        }
    }
    const len = end - start;
    return { current: { start, end: end + 1 }, previous: { start: start - len, end: start } };
}

export const inRange = (o: AdminOrder, r: Range) => o.created * 1000 >= r.start && o.created * 1000 < r.end;

// Orders that count as sales: anything that was paid (refunds are subtracted, not hidden)
export const isSale = (o: AdminOrder) => o.payment.status !== "unpaid";

// Queues used by the home page, the sidebar badge and the order tabs
export const isToShip = (o: AdminOrder) =>
    o.fulfillment.status === "unfulfilled" && o.payment.status !== "refunded" && o.payment.status !== "unpaid" && !o.archived;
export const isAwaitingShipment = (o: AdminOrder) => o.fulfillment.status === "label_created" && o.payment.status !== "refunded" && !o.archived;

export type Kpis = { netSales: number; grossSales: number; orders: number; aov: number; refunds: number; itemsSold: number };

export function kpis(orders: AdminOrder[]): Kpis {
    const sales = orders.filter(isSale);
    const grossSales = sales.reduce((s, o) => s + o.amountTotal, 0);
    const refunds = sales.reduce((s, o) => s + o.payment.refundedAmount, 0);
    return {
        grossSales,
        netSales: grossSales - refunds,
        orders: sales.length,
        aov: sales.length ? Math.round(grossSales / sales.length) : 0,
        refunds,
        itemsSold: sales.filter((o) => o.payment.status !== "refunded").reduce((s, o) => s + o.itemCount, 0),
    };
}

// % change vs the previous period; null when there is nothing to compare with
export function change(current: number, previous: number | undefined): number | null {
    if (previous === undefined) return null;
    if (previous === 0) return current === 0 ? 0 : null;
    return ((current - previous) / Math.abs(previous)) * 100;
}

export type Bucket = { key: string; label: string; longLabel: string; value: number; orders: number };

// Net sales per hour (today), day (up to 90 days) or month (longer)
export function salesBuckets(orders: AdminOrder[], range: Range, key: PeriodKey): Bucket[] {
    const unit: "hour" | "day" | "month" = key === "today" ? "hour" : key === "12m" || key === "all" ? "month" : "day";
    const buckets: Bucket[] = [];
    const index = new Map<string, Bucket>();
    const keyOf = (d: Date) =>
        unit === "hour" ? `${d.getHours()}` : unit === "day" ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : `${d.getFullYear()}-${d.getMonth()}`;

    const cursor = new Date(range.start);
    const last = Math.min(range.end, Date.now() + 1);
    while (cursor.getTime() < last) {
        const label =
            unit === "hour"
                ? `${String(cursor.getHours()).padStart(2, "0")}:00`
                : unit === "day"
                  ? cursor.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                  : cursor.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
        const longLabel =
            unit === "hour"
                ? `${label} to ${String(cursor.getHours() + 1).padStart(2, "0")}:00`
                : unit === "day"
                  ? cursor.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
                  : cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
        const b = { key: keyOf(cursor), label, longLabel, value: 0, orders: 0 };
        buckets.push(b);
        index.set(b.key, b);
        if (unit === "hour") cursor.setHours(cursor.getHours() + 1);
        else if (unit === "day") cursor.setDate(cursor.getDate() + 1);
        else cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const o of orders) {
        if (!isSale(o) || !inRange(o, range)) continue;
        const b = index.get(keyOf(new Date(o.created * 1000)));
        if (!b) continue;
        b.value += o.netAmount;
        b.orders += 1;
    }
    return buckets;
}

export type Tally = { label: string; quantity: number; revenue: number; orders: number };

// Count items by a property (design, type, colour, size). Fully refunded orders are left out.
export function tallyItems(orders: AdminOrder[], pick: (item: AdminOrder["items"][number]) => string): Tally[] {
    const map = new Map<string, Tally & { orderIds: Set<string> }>();
    for (const o of orders) {
        if (!isSale(o) || o.payment.status === "refunded") continue;
        for (const item of o.items) {
            const label = pick(item) || "Not specified";
            const t = map.get(label) ?? { label, quantity: 0, revenue: 0, orders: 0, orderIds: new Set<string>() };
            t.quantity += item.quantity;
            t.revenue += item.totalAmount;
            t.orderIds.add(o.id);
            map.set(label, t);
        }
    }
    return [...map.values()]
        .map(({ orderIds, ...t }) => ({ ...t, orders: orderIds.size }))
        .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);
}

// Count orders by a property (country, language)
export function tallyOrders(orders: AdminOrder[], pick: (o: AdminOrder) => string): Tally[] {
    const map = new Map<string, Tally>();
    for (const o of orders) {
        if (!isSale(o)) continue;
        const label = pick(o) || "Unknown";
        const t = map.get(label) ?? { label, quantity: 0, revenue: 0, orders: 0 };
        t.orders += 1;
        t.quantity += o.itemCount;
        t.revenue += o.netAmount;
        map.set(label, t);
    }
    return [...map.values()].sort((a, b) => b.orders - a.orders || b.revenue - a.revenue);
}

export type Customer = {
    key: string;
    email: string;
    name: string;
    phone: string;
    country: string;
    locale: string;
    orders: AdminOrder[];
    orderCount: number;
    totalSpent: number; // net, after refunds
    firstOrder: number;
    lastOrder: number;
};

// Stable short id for a customer, so emails never appear in URLs
export function customerKey(email: string, name = "") {
    const s = (email || `name:${name}`).trim().toLowerCase();
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
        h2 = Math.imul(h2 + c, 2246822519) >>> 0;
    }
    return h1.toString(36) + h2.toString(36);
}

export function groupCustomers(orders: AdminOrder[]): Customer[] {
    const map = new Map<string, Customer>();
    // oldest first, so the latest order's name/country wins
    for (const o of [...orders].sort((a, b) => a.created - b.created)) {
        const key = customerKey(o.customer.email, o.customer.name || o.shipping.name);
        const c =
            map.get(key) ??
            ({
                key,
                email: o.customer.email,
                name: "",
                phone: "",
                country: "",
                locale: "",
                orders: [],
                orderCount: 0,
                totalSpent: 0,
                firstOrder: o.created,
                lastOrder: o.created,
            } as Customer);
        c.orders.push(o);
        c.name = o.customer.name || o.shipping.name || c.name;
        c.phone = o.customer.phone || c.phone;
        c.country = o.shipping.country || c.country;
        c.locale = o.locale || c.locale;
        c.lastOrder = o.created;
        if (isSale(o)) {
            c.orderCount += 1;
            c.totalSpent += o.netAmount;
        }
        map.set(key, c);
    }
    for (const c of map.values()) c.orders.reverse();
    return [...map.values()].sort((a, b) => b.lastOrder - a.lastOrder);
}

// Days from order to "shipped", only for orders that recorded the shipping time
export function shippingDays(orders: AdminOrder[]) {
    const days = orders
        .filter((o) => o.fulfillment.shippedAt)
        .map((o) => (new Date(o.fulfillment.shippedAt!).getTime() - o.created * 1000) / 86400000)
        .filter((d) => d >= 0);
    return { count: days.length, average: days.length ? days.reduce((s, d) => s + d, 0) / days.length : null };
}

// "2 items: Konya T-shirt, Rize Hoodie"
export function itemsSummary(o: AdminOrder) {
    const names = o.items.map((i) => [i.title, i.productType].filter(Boolean).join(" ") + (i.quantity > 1 ? ` ×${i.quantity}` : ""));
    return `${o.itemCount} item${o.itemCount === 1 ? "" : "s"}: ${names.join(", ")}`;
}

export function searchOrder(o: AdminOrder, q: string) {
    const needle = q.trim().toLowerCase().replace(/^#/, "");
    if (!needle) return true;
    const hay = [
        o.number,
        o.id,
        o.customer.name,
        o.customer.email,
        o.customer.phone,
        o.shipping.name,
        o.shipping.city,
        o.shipping.postalCode,
        o.fulfillment.trackingCode || "",
        o.flag,
        ...o.items.map((i) => `${i.title} ${i.productType}`),
    ]
        .join(" ")
        .toLowerCase();
    return needle.split(/\s+/).every((w) => hay.includes(w));
}

// A cell starting with one of these is run as a formula by Excel / Sheets / Numbers
const FORMULA_START = /^[=+\-@\t\r]/;
// A phone number ("+31 6 12345678", "+90 (532) 123-45-67"): only digits, spaces and + ( ) . -,
// which cannot form a formula, so it keeps its leading + for the label tools
const PHONE = /^\+?[\d\s().-]{6,}$/;

// CSV with a BOM so Excel opens accents (ğ, ş, ü) correctly. Text that a spreadsheet would read as a
// formula (=, +, -, @, tab, CR at the start: customer names, notes, addresses) gets a leading ' so it
// stays plain text. Numbers and phone numbers are written as they are.
export function toCsv(rows: (string | number)[][]) {
    const esc = (v: string | number) => {
        let s = String(v ?? "");
        if (typeof v !== "number" && FORMULA_START.test(s) && !PHONE.test(s)) s = `'${s}`;
        return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n");
}

// Exports use the shop's local time (Amsterdam), whatever the browser's timezone: "2026-10-05 14:05"
const AMS_DATE_TIME = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});
const AMS_DATE = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" });
const toDate = (v: number | string) => (typeof v === "number" ? new Date(v * 1000) : new Date(v));
// Unix seconds or ISO string → local Amsterdam time
export const csvDateTime = (v: number | string | null | undefined) => (v ? AMS_DATE_TIME.format(toDate(v)) : "");
export const csvDate = (v: number | string | null | undefined) => (v ? AMS_DATE.format(toDate(v)) : "");
// Today's date in Amsterdam, for file names
export const csvToday = () => AMS_DATE.format(new Date());

export function downloadCsv(filename: string, rows: (string | number)[][]) {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const eur = (cents: number | null | undefined) => ((cents || 0) / 100).toFixed(2);

// Item value before discount and shipping. Stripe orders: total - shipping + discount; when the
// shipping amount is unknown (old orders), the sum of the line items.
export function orderSubtotal(o: AdminOrder) {
    if (o.amountShipping !== null) return o.amountTotal - (o.amountShipping || 0) + (o.amountDiscount || 0);
    return o.items.reduce((s, i) => s + i.totalAmount, 0);
}

export function ordersCsvRows(orders: AdminOrder[]) {
    const head = [
        "Order",
        "Date (Amsterdam time)",
        "Customer",
        "Email",
        "Phone",
        "Address",
        "Postal code",
        "City",
        "Country",
        "Items",
        "Currency",
        "Subtotal",
        "Shipping",
        "Discount",
        "Total",
        "Refunded",
        "Net",
        "Payment",
        "Fulfillment",
        "Shipped (Amsterdam time)",
        "Tracking",
        "Tag",
        "Notes",
    ];
    const rows = orders.map((o) => [
        o.number,
        csvDateTime(o.created),
        o.customer.name || o.shipping.name,
        o.customer.email,
        o.customer.phone || o.shipping.phone,
        [o.shipping.line1, o.shipping.line2].filter(Boolean).join(", "),
        o.shipping.postalCode,
        o.shipping.city,
        o.shipping.country,
        o.items
            .map((i) => [i.quantity > 1 ? `${i.quantity}x` : "", i.title, i.productType, i.color, i.size].filter(Boolean).join(" "))
            .join(" | "),
        o.currency.toUpperCase(),
        eur(orderSubtotal(o)),
        o.amountShipping === null ? "" : eur(o.amountShipping),
        o.amountDiscount === null ? "" : eur(o.amountDiscount),
        eur(o.amountTotal),
        eur(o.payment.refundedAmount),
        eur(o.netAmount),
        o.payment.status,
        o.fulfillment.status,
        csvDateTime(o.fulfillment.shippedAt),
        [o.fulfillment.trackingProvider, o.fulfillment.trackingCode].filter(Boolean).join(" "),
        o.flag,
        o.notes,
    ]);
    return [head, ...rows];
}
