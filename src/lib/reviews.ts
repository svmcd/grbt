import crypto from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeOrder } from "@/lib/admin/orders";
import { getPrimaryImageForSlug, slugForCity, titleCaseCity } from "@/lib/catalog";

// Verified reviews: only customers with a shipped order get a private review link.
// Reviews are stored in Firestore "reviews" and shown after the shop approves them.

export type ReviewStatus = "pending" | "approved" | "hidden";
export type Review = {
    id: string;
    orderId: string;
    orderNumber: string;
    slug: string;
    productTitle: string;
    rating: number;
    text: string;
    name: string;
    locale: string;
    createdAt: string;
    status: ReviewStatus;
};

export const REVIEW_REQUEST_AFTER_DAYS = 10;

export const newToken = () => crypto.randomBytes(18).toString("base64url");

// "Ayşe Kaya" -> "Ayşe K."
export function displayName(full: string) {
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function orderByToken(token: string) {
    if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return null;
    const snap = await adminDb.collection("orders").where("review_token", "==", token).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, data: doc.data() as any };
}

// What the review page shows for a token
export async function reviewRequest(token: string) {
    const order = await orderByToken(token);
    if (!order || order.data.deleted) return null;
    const o = normalizeOrder(order.id, order.data);
    const slugs = [...new Set(o.items.map((i) => slugForCity(i.title)).filter((s): s is string => Boolean(s)))];
    return {
        name: displayName(o.customer.name || o.shipping.name),
        locale: o.locale,
        submitted: Boolean(order.data.review_submitted_at),
        products: slugs.map((slug) => ({ slug, title: titleCaseCity(slug), image: getPrimaryImageForSlug(slug) })),
    };
}

export async function submitReviews(token: string, name: string, entries: { slug: string; rating: number; text: string }[]) {
    const order = await orderByToken(token);
    if (!order || order.data.deleted) return { ok: false as const, error: "not_found" };
    if (order.data.review_submitted_at) return { ok: false as const, error: "already_submitted" };
    const request = await reviewRequest(token);
    const allowed = new Set(request?.products.map((p) => p.slug));
    const valid = entries.filter((e) => allowed.has(e.slug) && e.rating >= 1 && e.rating <= 5);
    if (!valid.length) return { ok: false as const, error: "empty" };

    const o = normalizeOrder(order.id, order.data);
    const now = new Date().toISOString();
    const batch = adminDb.batch();
    for (const e of valid) {
        batch.set(adminDb.collection("reviews").doc(), {
            orderId: order.id,
            orderNumber: o.number,
            slug: e.slug,
            productTitle: titleCaseCity(e.slug),
            rating: Math.round(e.rating),
            text: String(e.text || "").trim().slice(0, 1500),
            name: String(name || "").trim().slice(0, 60) || displayName(o.customer.name),
            locale: o.locale,
            createdAt: now,
            status: "pending",
        });
    }
    batch.update(adminDb.collection("orders").doc(order.id), { review_submitted_at: now });
    await batch.commit();
    return { ok: true as const };
}

function toReview(id: string, d: any): Review {
    return {
        id,
        orderId: d.orderId,
        orderNumber: d.orderNumber || "",
        slug: d.slug,
        productTitle: d.productTitle || titleCaseCity(d.slug),
        rating: Number(d.rating) || 0,
        text: d.text || "",
        name: d.name || "",
        locale: d.locale || "",
        createdAt: d.createdAt || "",
        status: d.status || "pending",
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function allReviews(): Promise<Review[]> {
    const snap = await adminDb.collection("reviews").get();
    return snap.docs.map((d) => toReview(d.id, d.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
    const ref = adminDb.collection("reviews").doc(id);
    await ref.update({ status, moderatedAt: new Date().toISOString() });
    const doc = await ref.get();
    return toReview(doc.id, doc.data());
}

// Approved reviews for a product, newest first, plus the average
export async function productReviews(slug: string) {
    const snap = await adminDb.collection("reviews").where("slug", "==", slug).where("status", "==", "approved").get();
    const reviews = snap.docs
        .map((d) => toReview(d.id, d.data()))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(({ name, rating, text, createdAt, locale }) => ({ name, rating, text, createdAt, locale }));
    const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return { count: reviews.length, average: Math.round(average * 10) / 10, reviews };
}
