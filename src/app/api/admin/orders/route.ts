import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin/auth";
import { addressTooLong, normalizeOrder, type AdminActivity } from "@/lib/admin/orders";
import { lastSync } from "@/lib/admin/stripe-sync";
import { allCatalogSlugs, colorsFor, titleCaseCity, type ProductType } from "@/lib/catalog";
import { describeCheckoutItem } from "@/lib/emails/line-items";
import { isLocale } from "@/i18n/config";
import { orderNumber } from "@/lib/order-number";

// Admin orders: list (normalized) and the actions the order screens need.

export async function GET(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const snap = await adminDb.collection("orders").get();
    const orders = snap.docs
        .filter((d) => !d.data().deleted)
        .map((d) => normalizeOrder(d.id, d.data()))
        .sort((a, b) => b.created - a.created);
    return NextResponse.json({ orders, lastSync: await lastSync() });
}

// Fields the admin may edit directly on an order
const EDITABLE = new Set(["notes", "custom_flag", "customer_name", "customer_phone", "customer_email", "archived"]);

const CATALOG_SLUGS = new Set(allCatalogSlugs());
const PRODUCT_TYPES = new Set(["tshirt", "longsleeve", "hoodie", "sweater"]);
const SIZES = new Set(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
const MAX_BULK = 200;

type ManualItem = { slug: string; productType: string; color: string; size: string; quantity: number; unitPriceEuros: number };

const cents = (euros: unknown) => Math.round((Number(euros) || 0) * 100);
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const activity = (by: string, title: string, detail?: string): AdminActivity => ({ at: new Date().toISOString(), by, title, ...(detail ? { detail } : {}) });

function addressSummary(o: any) {
    const ship = o?.shipping_details || {};
    const a = ship.address || ship;
    return [ship.name, a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(" "), a.country, ship.phone].filter(Boolean).join(", ");
}

// A fully refunded order is never packed, shipped or emailed by a bulk run
const isFullyRefunded = (id: string, o: FirebaseFirestore.DocumentData) => normalizeOrder(id, o).payment.status === "refunded";
const REFUNDED_SKIP = "fully refunded: no status change and no customer email";

// Same per-order rules as the single actions, so a bulk run never re-dates shipped orders
async function applyBulk(op: string, ids: string[], by: string) {
    const now = new Date().toISOString();
    const skipped: string[] = [];
    const skippedReasons: Record<string, string> = {};
    const refs = ids.map((id) => adminDb.collection("orders").doc(id));
    const snaps = await adminDb.getAll(...refs);
    const batch = adminDb.batch();
    for (const snap of snaps) {
        const o = snap.data();
        if (!snap.exists || !o || o.deleted) {
            skipped.push(snap.id);
            continue;
        }
        if (op === "mark_label") {
            if (isFullyRefunded(snap.id, o)) {
                skipped.push(snap.id);
                skippedReasons[snap.id] = REFUNDED_SKIP;
                continue;
            }
            if (o.shipped_out || o.shipped || o.label_created) {
                skipped.push(snap.id);
                skippedReasons[snap.id] = "already past this step";
                continue;
            }
            batch.update(snap.ref, { label_created: true, label_created_at: now, archived: false, updated_at: now });
        } else if (op === "archive" || op === "unarchive") {
            batch.update(snap.ref, { archived: op === "archive", updated_at: now, activity: FieldValue.arrayUnion(activity(by, op === "archive" ? "Archived" : "Unarchived")) });
        } else {
            throw new Error("Unknown bulk action");
        }
    }
    await batch.commit();
    const after = await adminDb.getAll(...refs);
    return { orders: after.filter((d) => d.exists && !d.data()?.deleted).map((d) => normalizeOrder(d.id, d.data())), skipped, skippedReasons };
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const { action, orderId } = body as { action: string; orderId: string };
    const now = new Date().toISOString();
    const ref = orderId ? adminDb.collection("orders").doc(orderId) : null;

    switch (action) {
        case "update": {
            const data = Object.fromEntries(Object.entries(body.data || {}).filter(([k]) => EDITABLE.has(k)));
            if (!ref || !Object.keys(data).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
            await ref.update({ ...data, updated_at: now });
            break;
        }
        case "mark_label": {
            if (!ref) return NextResponse.json({ error: "Missing order" }, { status: 400 });
            const existing = (await ref.get()).data();
            if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
            await ref.update({ label_created: true, label_created_at: existing.label_created_at || now, archived: false, updated_at: now });
            break;
        }
        case "mark_shipped": {
            const { trackingProvider, trackingCode } = body as { trackingProvider?: string; trackingCode?: string };
            if (!ref || !trackingProvider || !trackingCode?.trim()) return NextResponse.json({ error: "Tracking provider and code are required" }, { status: 400 });
            const existing = (await ref.get()).data();
            if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
            if (body.bulk && isFullyRefunded(ref.id, existing)) {
                return NextResponse.json({ error: `Skipped: this order is ${REFUNDED_SKIP}`, skipped: "refunded" }, { status: 409 });
            }
            const code = trackingCode.trim();
            const alreadyShipped = Boolean(existing.shipped_out || existing.shipped);
            const fields: Record<string, unknown> = {
                label_created: true,
                shipped_out: true,
                shipped: true,
                tracking_provider: trackingProvider,
                tracking_code: code,
                archived: false,
                updated_at: now,
            };
            if (alreadyShipped) {
                // Changing the tracking of a shipped order is a correction, not a second shipment:
                // the original ship date stays (orders shipped before it was recorded get none)
                if (existing.tracking_code !== code || existing.tracking_provider !== trackingProvider) {
                    const before = [existing.tracking_provider, existing.tracking_code].filter(Boolean).join(" ") || "none";
                    fields.activity = FieldValue.arrayUnion(activity(admin.email, "Tracking changed", `${before} → ${trackingProvider} ${code}`));
                }
            } else {
                fields.shipped_at = now;
            }
            await ref.update(fields);
            break;
        }
        case "mark_unfulfilled": {
            if (!ref) return NextResponse.json({ error: "Missing order" }, { status: 400 });
            await ref.update({
                label_created: false,
                shipped_out: false,
                shipped: false,
                updated_at: now,
                activity: FieldValue.arrayUnion(activity(admin.email, "Marked as unfulfilled")),
            });
            break;
        }
        case "update_address": {
            if (!ref) return NextResponse.json({ error: "Missing order" }, { status: 400 });
            const existing = (await ref.get()).data();
            if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
            const a = body.address || {};
            const country = str(a.country, 10).toUpperCase();
            if (!str(a.line1) || !str(a.city) || !country) return NextResponse.json({ error: "Address, city and country are required" }, { status: 400 });
            if (!/^[A-Z]{2}$/.test(country)) return NextResponse.json({ error: "Choose a country from the list" }, { status: 400 });
            // Refuse rather than cut: a shortened street or city would end up on the label
            const tooLong = addressTooLong(a);
            if (tooLong) return NextResponse.json({ error: tooLong }, { status: 400 });
            const prevShip = existing.shipping_details || {};
            const prevAddr = prevShip.address || prevShip;
            // A state or province only belongs to the country it was entered for
            const sameCountry = String(prevAddr.country || "").toUpperCase() === country;
            // Stripe's shape ({ name, address: {...} }), which normalizeOrder and the order pages read
            const shipping_details = {
                name: str(a.name),
                phone: str(a.phone, 40),
                address: {
                    line1: str(a.line1),
                    line2: str(a.line2),
                    postal_code: str(a.postalCode, 20),
                    city: str(a.city),
                    country,
                    state: (sameCountry && prevAddr.state) || null,
                },
            };
            await ref.update({
                shipping_details,
                updated_at: now,
                activity: FieldValue.arrayUnion(activity(admin.email, "Shipping address changed", `Was: ${addressSummary(existing) || "none"}`)),
            });
            break;
        }
        case "bulk": {
            const ids: string[] = Array.isArray(body.orderIds) ? body.orderIds.filter((x: unknown) => typeof x === "string").slice(0, MAX_BULK) : [];
            if (!ids.length) return NextResponse.json({ error: "No orders selected" }, { status: 400 });
            try {
                return NextResponse.json({ ok: true, ...(await applyBulk(String(body.op), ids, admin.email)) });
            } catch (e) {
                return NextResponse.json({ error: e instanceof Error ? e.message : "Bulk action failed" }, { status: 400 });
            }
        }
        case "delete": {
            if (!ref) return NextResponse.json({ error: "Missing order" }, { status: 400 });
            await ref.update({ deleted: true, deleted_at: now, deleted_by: admin.email, updated_at: now });
            break;
        }
        case "create": {
            // Manual order (e.g. sold in person). Items come from the catalog and are stored in the
            // same Turkish description format as checkout orders ("Konya Tişört - siyah, M",
            // "Konya Hoodie - gece mavisi, M", "Konya Uzun Kollu - kırmızı, M"), so analytics count them by
            // design, type, color and size. Colours must be sold for that design and type (colorsFor: none
            // for a Hasret/Sinema long sleeve). Prices in euros from the form.
            const d = body.data || {};
            const raw: ManualItem[] = Array.isArray(d.items) ? d.items : [];
            if (!raw.length) return NextResponse.json({ error: "Add at least one item" }, { status: 400 });
            for (const it of raw) {
                if (!CATALOG_SLUGS.has(it?.slug)) return NextResponse.json({ error: `Unknown design: ${it?.slug}` }, { status: 400 });
                if (!PRODUCT_TYPES.has(it.productType) || !colorsFor(it.slug, it.productType as ProductType).includes(it.color) || !SIZES.has(it.size))
                    return NextResponse.json({ error: "Every item needs a product type, color and size" }, { status: 400 });
                if (!(Number(it.quantity) >= 1) || !(Number(it.unitPriceEuros) >= 0)) return NextResponse.json({ error: "Check the quantities and prices" }, { status: 400 });
            }
            const lines = raw.map((it) => {
                const quantity = Math.min(99, Math.floor(Number(it.quantity)));
                const unit = cents(it.unitPriceEuros);
                const description = describeCheckoutItem({ city: titleCaseCity(it.slug), productType: it.productType, color: it.color, size: it.size }, "tr").name;
                return { description, quantity, unit, subtotal: unit * quantity };
            });
            const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
            const shipping = Math.max(0, cents(d.shippingEuros));
            const discount = Math.min(subtotal, Math.max(0, cents(d.discountEuros)));
            // Spread the discount over the items like Stripe does (amount_total is after discounts)
            let left = discount;
            const line_items = lines.map((l, i) => {
                const share = i === lines.length - 1 ? left : subtotal ? Math.round((discount * l.subtotal) / subtotal) : 0;
                left -= share;
                return {
                    description: l.description,
                    quantity: l.quantity,
                    price: { unit_amount: l.unit, currency: "eur" },
                    amount_subtotal: l.subtotal,
                    amount_discount: share,
                    amount_total: l.subtotal - share,
                    currency: "eur",
                };
            });
            const id = `manual_${Date.now()}`;
            const address = {
                line1: str(d.line1),
                line2: str(d.line2),
                city: str(d.city),
                postal_code: str(d.postalCode, 20),
                country: str(d.country, 2).toUpperCase() || "NL",
            };
            await adminDb.collection("orders").doc(id).set({
                stripe_id: id,
                order_number: orderNumber(id),
                manual: true,
                amount_total: subtotal - discount + shipping,
                amount_shipping: shipping,
                amount_discount: discount,
                currency: "eur",
                customer_email: str(d.email),
                customer_name: str(d.name),
                customer_phone: str(d.phone, 40),
                payment_status: "paid",
                status: "complete",
                created: Math.floor(Date.now() / 1000),
                shipping_details: { name: str(d.name), phone: str(d.phone, 40), address },
                line_items,
                locale: isLocale(d.locale) ? d.locale : "tr",
                shipped: false,
                custom_flag: "",
                notes: str(d.notes, 5000),
                deleted: false,
                created_at: now,
                updated_at: now,
                created_by: admin.email,
            });
            return NextResponse.json({ ok: true, id });
        }
        default:
            return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const doc = await ref!.get();
    return NextResponse.json({ ok: true, order: normalizeOrder(doc.id, doc.data()) });
}
