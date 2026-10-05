import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { lineItemsForStorage } from "@/lib/emails/line-items";
import { sessionLocale } from "@/lib/emails/order-confirmation";

// Brings Firestore orders in line with Stripe: refunds (also partial), customer name/phone,
// shipping and discount amounts, and paid checkouts that never reached Firestore.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });

// Live-mode test payments (1-3 cents) from the launch are not real orders
const MIN_REAL_ORDER_CENTS = 100;
// Imported orders older than this were fulfilled outside the admin; keep them out of the to-do queue
const ARCHIVE_IMPORTED_AFTER_DAYS = 30;

export type SyncResult = {
    checkedSessions: number;
    imported: number;
    updated: number;
    refundsFound: number;
    syncedAt: string;
};

export async function syncWithStripe(): Promise<SyncResult> {
    const ordersRef = adminDb.collection("orders");
    const snap = await ordersRef.get();
    // Older orders are stored under a random document id with the session in stripe_id
    const docs = new Map(snap.docs.map((d) => [(d.data().stripe_id as string) || d.id, { ref: d.ref, data: d.data() }]));

    // Refunds per payment intent
    const refundsByPi = new Map<string, Stripe.Refund[]>();
    let refundsFound = 0;
    for await (const r of stripe.refunds.list({ limit: 100 })) {
        const pi = typeof r.payment_intent === "string" ? r.payment_intent : r.payment_intent?.id;
        if (!pi) continue;
        refundsFound++;
        refundsByPi.set(pi, [...(refundsByPi.get(pi) || []), r]);
    }

    const now = new Date().toISOString();
    let imported = 0;
    let updated = 0;
    let checkedSessions = 0;
    const batch = adminDb.batch();
    let batchSize = 0;

    for await (const s of stripe.checkout.sessions.list({ limit: 100 })) {
        if (s.payment_status !== "paid") continue;
        checkedSessions++;
        const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id || null;
        const refunds = (pi && refundsByPi.get(pi)) || [];
        const refundedAmount = refunds.filter((r) => r.status === "succeeded").reduce((sum, r) => sum + r.amount, 0);
        const stripeFields = {
            payment_intent: pi,
            customer_name: s.customer_details?.name || "",
            customer_phone: s.customer_details?.phone || "",
            amount_shipping: s.total_details?.amount_shipping ?? null,
            amount_discount: s.total_details?.amount_discount ?? null,
            currency: s.currency || "eur",
            stripe_refunds: refunds.map((r) => ({ id: r.id, amount: r.amount, created: r.created, reason: r.reason ?? null, status: r.status })),
            refunded_amount: refundedAmount,
            stripe_synced_at: now,
        };

        const found = docs.get(s.id);
        const existing = found?.data;
        if (found && existing) {
            const changed =
                existing.refunded_amount !== refundedAmount ||
                existing.payment_intent !== pi ||
                (existing.stripe_refunds || []).length !== refunds.length ||
                existing.customer_name === undefined ||
                existing.amount_shipping === undefined;
            if (changed) {
                // Keep a name someone typed in the admin
                const fields = { ...stripeFields } as Record<string, unknown>;
                if (existing.customer_name) delete fields.customer_name;
                if (existing.customer_phone) delete fields.customer_phone;
                batch.update(found.ref, fields);
                batchSize++;
                updated++;
            }
        } else if ((s.amount_total || 0) >= MIN_REAL_ORDER_CENTS) {
            const detailed = await stripe.checkout.sessions.retrieve(s.id, { expand: ["line_items.data.price.product"] });
            const ageDays = (Date.now() / 1000 - s.created) / 86400;
            batch.set(ordersRef.doc(s.id), {
                stripe_id: s.id,
                amount_total: s.amount_total || 0,
                customer_email: s.customer_details?.email || "",
                payment_status: "paid",
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
            });
            batchSize++;
            imported++;
        }

        if (batchSize >= 400) {
            await batch.commit();
            return finish({ checkedSessions, imported, updated, refundsFound, syncedAt: now }, true);
        }
    }

    if (batchSize > 0) await batch.commit();
    return finish({ checkedSessions, imported, updated, refundsFound, syncedAt: now }, false);
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

async function finish(result: SyncResult, partial: boolean): Promise<SyncResult> {
    await adminDb.collection("admin_meta").doc("stripe_sync").set({ ...result, partial }, { merge: true });
    return result;
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
        if (s.payment_status === "paid") {
            if (email) paidEmails.set(email, Math.max(paidEmails.get(email) || 0, s.created));
        } else if (s.status === "expired" && email) {
            candidates.push(s);
        }
    }
    const out: AbandonedCheckout[] = [];
    for (const s of candidates) {
        const email = s.customer_details!.email!.toLowerCase();
        const items = await stripe.checkout.sessions.listLineItems(s.id, { limit: 20 });
        out.push({
            id: s.id,
            created: s.created,
            email,
            name: s.customer_details?.name || "",
            country: s.customer_details?.address?.country || "",
            amountTotal: s.amount_total || 0,
            items: items.data.map((i) => `${i.quantity}× ${i.description}`),
            locale: s.metadata?.locale || "",
            recovered: (paidEmails.get(email) || 0) > s.created,
        });
    }
    return out.sort((a, b) => b.created - a.created);
}
