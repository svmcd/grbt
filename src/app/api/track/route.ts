import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeOrder, type AdminOrder } from "@/lib/admin/orders";
import { clientIp } from "@/lib/traffic";

// POST { order, email } → the status of one order for the /track page.
// The order number is the one in the emails: the last 8 characters of the Stripe session id.
// Wrong number and wrong email get the same answer. Only status, dates, carrier, tracking
// and item names are returned: never address, phone or amounts.

const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404 });

// Light per-IP limit (per server instance): 8 lookups per minute
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
    const now = Date.now();
    if (attempts.size > 5000) for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
    const entry = attempts.get(ip);
    if (!entry || entry.resetAt <= now) {
        attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    entry.count++;
    return entry.count > MAX_ATTEMPTS;
}

const TYPE_KEYS: Record<string, "tshirt" | "hoodie" | "sweater"> = { "T-shirt": "tshirt", Hoodie: "hoodie", Sweater: "sweater" };

// Every order stores its order_number (new orders at checkout and on Stripe import, older ones by
// scripts/backfill-order-number.mjs), so one indexed query finds it; the email is compared
// case-insensitively on the few documents it returns.
async function findOrder(number: string, email: string) {
    const snap = await adminDb.collection("orders").where("order_number", "==", number).limit(10).get();
    const doc = snap.docs.find((d) => {
        const o = d.data();
        return String(o.customer_email || "").trim().toLowerCase() === email && !o.deleted;
    });
    return doc ? { id: doc.id, data: doc.data() } : null;
}

// What the customer sees: a refund says so first; an order archived without being marked shipped
// (handed over in person, or shipped before the admin tracked it) is "completed", not "being prepared".
function trackStatus(o: AdminOrder) {
    if (o.payment.status === "refunded") return "refunded";
    const f = o.fulfillment.status;
    if (f === "shipped") return "shipped";
    if (o.archived) return "completed";
    return f === "unfulfilled" ? "paid" : f;
}

export async function POST(request: NextRequest) {
    if (rateLimited(clientIp(request.headers) || "unknown")) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    try {
        const body = await request.json().catch(() => ({}));
        const number = String(body?.order ?? "").replace(/[\s#]/g, "").toUpperCase();
        const email = String(body?.email ?? "").trim().toLowerCase();
        if (!/^[A-Z0-9_]{8}$/.test(number) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return notFound();
        }

        const found = await findOrder(number, email);
        if (!found) return notFound();

        const o = normalizeOrder(found.id, found.data);
        if (o.payment.status === "unpaid") return notFound();

        const f = o.fulfillment;
        return NextResponse.json(
            {
                number: o.number,
                status: trackStatus(o), // paid | label_created | shipped | completed | refunded
                orderedAt: o.created ? new Date(o.created * 1000).toISOString() : null,
                shippedAt: f.status === "shipped" ? f.shippedAt : null,
                carrier: f.trackingProvider,
                trackingCode: f.trackingCode,
                trackingUrl: f.trackingUrl,
                items: o.items.map((i) => ({ title: i.title, type: TYPE_KEYS[i.productType] ?? null, quantity: i.quantity })),
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Order tracking failed:", error);
        return NextResponse.json({ error: "failed" }, { status: 500 });
    }
}
