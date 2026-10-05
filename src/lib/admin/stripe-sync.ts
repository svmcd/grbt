import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { lineItemsForStorage } from "@/lib/emails/line-items";
import { sessionLocale } from "@/lib/emails/order-confirmation";
import { orderNumber } from "@/lib/order-number";

// Brings Firestore orders in line with Stripe: refunds (also partial), customer name/phone,
// shipping and discount amounts, and paid checkouts that never reached Firestore.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });

// Live-mode test payments (1-3 cents) from the launch are not real orders
const MIN_REAL_ORDER_CENTS = 100;
// Imported orders older than this were fulfilled outside the admin; keep them out of the to-do queue
const ARCHIVE_IMPORTED_AFTER_DAYS = 30;

// Incremental runs look this far behind the last complete sync, so a session or refund that
// was created while the previous run was going is still picked up.
const SAFETY_WINDOW_SECONDS = 3 * 86400;
// Stop before the 60 s function limit and report the run as partial
const TIME_BUDGET_MS = 45_000;
// Firestore allows 500 writes per batch
const BATCH_LIMIT = 400;
// Firestore / gRPC status for create() on a document that already exists
const ALREADY_EXISTS = 6;

// A completed checkout that counts as an order: paid, or brought to zero by a 100% promotion code
const isPaidSession = (s: Stripe.Checkout.Session) => s.payment_status === "paid" || s.payment_status === "no_payment_required";

export type SyncResult = {
    checkedSessions: number;
    imported: number;
    updated: number;
    refundsFound: number;
    syncedAt: string;
    partial: boolean; // stopped early (time limit); the next run continues from the last complete sync
    full: boolean; // looked at every checkout session ever made
    since: string | null; // start of the window that was checked (null: everything)
    lastCompleteAt?: string | null; // last run that finished
};

type Doc = { ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData };

const refundFields = (refunds: Stripe.Refund[]) => ({
    stripe_refunds: refunds.map((r) => ({ id: r.id, amount: r.amount, created: r.created, reason: r.reason ?? null, status: r.status })),
    refunded_amount: refunds.filter((r) => r.status === "succeeded").reduce((sum, r) => sum + r.amount, 0),
});

// full: page through every checkout session (manual "Full resync"). Otherwise only sessions and
// refunds created since the last complete sync minus the safety window.
export async function syncWithStripe({ full = false }: { full?: boolean } = {}): Promise<SyncResult> {
    const started = Date.now();
    const outOfTime = () => Date.now() - started > TIME_BUDGET_MS;
    const previous = await lastSync();
    const lastCompleteAt = previous?.lastCompleteAt || (previous && !previous.partial ? previous.syncedAt : null);
    const sinceSec = !full && lastCompleteAt ? Math.floor(new Date(lastCompleteAt).getTime() / 1000) - SAFETY_WINDOW_SECONDS : null;
    const created = sinceSec ? { created: { gte: sinceSec } } : {};

    const ordersRef = adminDb.collection("orders");
    const snap = await ordersRef.get();
    // Older orders are stored under a random document id with the session in stripe_id
    const docs = new Map<string, Doc>(snap.docs.map((d) => [(d.data().stripe_id as string) || d.id, { ref: d.ref, data: d.data() }]));
    const byPi = new Map<string, Doc>();
    for (const d of docs.values()) if (typeof d.data.payment_intent === "string") byPi.set(d.data.payment_intent, d);

    const now = new Date().toISOString();
    let imported = 0;
    let updated = 0;
    let checkedSessions = 0;
    let partial = false;
    let batch = adminDb.batch();
    let batchSize = 0;
    const write = async (fn: (b: FirebaseFirestore.WriteBatch) => void) => {
        fn(batch);
        batchSize++;
        if (batchSize >= BATCH_LIMIT) {
            await batch.commit();
            batch = adminDb.batch();
            batchSize = 0;
        }
    };

    // Refunds per payment intent (in the window; a refund is never older than its session)
    const refundsByPi = new Map<string, Stripe.Refund[]>();
    let refundsFound = 0;
    for await (const r of stripe.refunds.list({ limit: 100, ...created })) {
        const pi = typeof r.payment_intent === "string" ? r.payment_intent : r.payment_intent?.id;
        if (!pi) continue;
        refundsFound++;
        refundsByPi.set(pi, [...(refundsByPi.get(pi) || []), r]);
        if (outOfTime()) {
            partial = true;
            break;
        }
    }

    const sessionPis = new Set<string>();
    if (!partial) {
        for await (const s of stripe.checkout.sessions.list({ limit: 100, ...created })) {
            if (outOfTime()) {
                partial = true;
                break;
            }
            if (!isPaidSession(s)) continue;
            checkedSessions++;
            const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id || null;
            if (pi) sessionPis.add(pi);
            const refunds = (pi && refundsByPi.get(pi)) || [];
            const rf = refundFields(refunds);
            const stripeFields = {
                payment_intent: pi,
                customer_name: s.customer_details?.name || "",
                customer_phone: s.customer_details?.phone || "",
                amount_shipping: s.total_details?.amount_shipping ?? null,
                amount_discount: s.total_details?.amount_discount ?? null,
                currency: s.currency || "eur",
                ...rf,
                stripe_synced_at: now,
            };

            const found = docs.get(s.id);
            const existing = found?.data;
            if (found && existing) {
                const changed =
                    existing.refunded_amount !== rf.refunded_amount ||
                    existing.payment_intent !== pi ||
                    (existing.stripe_refunds || []).length !== refunds.length ||
                    existing.customer_name === undefined ||
                    existing.amount_shipping === undefined;
                if (changed) {
                    // Keep a name someone typed in the admin
                    const fields = { ...stripeFields } as Record<string, unknown>;
                    if (existing.customer_name) delete fields.customer_name;
                    if (existing.customer_phone) delete fields.customer_phone;
                    await write((b) => b.update(found.ref, fields));
                    updated++;
                }
            } else if ((s.amount_total || 0) >= MIN_REAL_ORDER_CENTS || s.payment_status === "no_payment_required") {
                // The checkout webhook may have saved this order since the list above was read
                // (under the session id, or under a random id on older documents): never overwrite it
                const legacy = await ordersRef.where("stripe_id", "==", s.id).limit(1).get();
                if (!legacy.empty) {
                    docs.set(s.id, { ref: legacy.docs[0].ref, data: legacy.docs[0].data() });
                    continue;
                }
                const detailed = await stripe.checkout.sessions.retrieve(s.id, { expand: ["line_items.data.price.product"] });
                const ageDays = (Date.now() / 1000 - s.created) / 86400;
                const doc = {
                    stripe_id: s.id,
                    amount_total: s.amount_total || 0,
                    customer_email: s.customer_details?.email || "",
                    order_number: orderNumber(s.id),
                    payment_status: s.payment_status,
                    status: s.status || "complete",
                    created: s.created,
                    shipping_details: detailed.collected_information?.shipping_details || s.customer_details?.address || null,
                    line_items: withProductDetails(detailed.line_items?.data || []),
                    locale: sessionLocale(detailed),
                    shipped: false,
                    custom_flag: "",
                    notes: "Imported from Stripe: this order was not saved at checkout, so shipping was not tracked here.",
                    deleted: false,
                    imported_from_stripe: true,
                    archived: ageDays > ARCHIVE_IMPORTED_AFTER_DAYS,
                    created_at: new Date(s.created * 1000).toISOString(),
                    updated_at: now,
                    ...stripeFields,
                };
                // create() (not in the batch: one existing document would fail the whole batch)
                // fails when the webhook saved the order in the meantime; that order stays as it is
                try {
                    await ordersRef.doc(s.id).create(doc);
                } catch (e) {
                    if ((e as { code?: unknown })?.code === ALREADY_EXISTS) continue;
                    throw e;
                }
                docs.set(s.id, { ref: ordersRef.doc(s.id), data: doc });
                imported++;
            }
        }
    }

    // Recent refunds on orders older than the window: reload that payment's full refund list
    if (!partial && sinceSec) {
        for (const pi of refundsByPi.keys()) {
            if (sessionPis.has(pi)) continue;
            const found = byPi.get(pi);
            if (!found) continue; // not an order we know (the full resync imports it)
            if (outOfTime()) {
                partial = true;
                break;
            }
            const all: Stripe.Refund[] = [];
            for await (const r of stripe.refunds.list({ payment_intent: pi, limit: 100 })) all.push(r);
            const rf = refundFields(all);
            if (found.data.refunded_amount !== rf.refunded_amount || (found.data.stripe_refunds || []).length !== all.length) {
                await write((b) => b.update(found.ref, { ...rf, stripe_synced_at: now }));
                updated++;
            }
        }
    }

    if (batchSize > 0) await batch.commit();
    const result: SyncResult = {
        checkedSessions,
        imported,
        updated,
        refundsFound,
        syncedAt: now,
        partial,
        full,
        since: sinceSec ? new Date(sinceSec * 1000).toISOString() : null,
        lastCompleteAt: partial ? lastCompleteAt : now,
    };
    await adminDb.collection("admin_meta").doc("stripe_sync").set(result, { merge: true });
    return result;
}

// Early checkouts used one "GRBT Order" product whose description lists the items;
// keep that text next to the stored item, as the old webhook did.
function withProductDetails(items: Stripe.LineItem[]) {
    const stored = lineItemsForStorage(items);
    return stored.map((li, i) => {
        const product = items[i].price?.product;
        if (!product || typeof product === "string" || product.deleted) return li;
        return { ...li, product_details: { name: product.name, description: product.description, images: product.images, metadata: product.metadata } };
    });
}

export async function lastSync(): Promise<SyncResult | null> {
    const doc = await adminDb.collection("admin_meta").doc("stripe_sync").get();
    return doc.exists ? (doc.data() as SyncResult) : null;
}

// Started checkouts that were never paid but left an email: worth a follow-up.
export type AbandonedCheckout = {
    id: string;
    created: number;
    email: string;
    name: string;
    country: string;
    amountTotal: number;
    items: string[];
    locale: string;
    recovered: boolean; // the same email paid later
};

export async function abandonedCheckouts(days = 90): Promise<AbandonedCheckout[]> {
    const since = Math.floor(Date.now() / 1000) - days * 86400;
    const paidEmails = new Map<string, number>();
    const candidates: Stripe.Checkout.Session[] = [];
    for await (const s of stripe.checkout.sessions.list({ limit: 100, created: { gte: since } })) {
        const email = s.customer_details?.email?.toLowerCase();
        if (isPaidSession(s)) {
            if (email) paidEmails.set(email, Math.max(paidEmails.get(email) || 0, s.created));
        } else if (s.status === "expired" && email) {
            candidates.push(s);
        }
    }
    // Line items: a few requests at a time instead of one after the other, so a 12-month range
    // finishes well within the 60 s limit
    const out = await mapLimit(candidates, LINE_ITEM_CONCURRENCY, async (s): Promise<AbandonedCheckout> => {
        const email = s.customer_details!.email!.toLowerCase();
        const items = await stripe.checkout.sessions.listLineItems(s.id, { limit: 20 });
        return {
            id: s.id,
            created: s.created,
            email,
            name: s.customer_details?.name || "",
            country: s.customer_details?.address?.country || "",
            amountTotal: s.amount_total || 0,
            items: items.data.map((i) => `${i.quantity}× ${i.description}`),
            locale: s.metadata?.locale || "",
            recovered: (paidEmails.get(email) || 0) > s.created,
        };
    });
    return out.sort((a, b) => b.created - a.created);
}

// Stripe allows plenty of read requests per second; 8 in flight keeps well below that
const LINE_ITEM_CONCURRENCY = 8;

async function mapLimit<T, R>(list: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const out: R[] = new Array(list.length);
    let next = 0;
    const worker = async () => {
        while (next < list.length) {
            const i = next++;
            out[i] = await fn(list[i]);
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, list.length) }, worker));
    return out;
}
