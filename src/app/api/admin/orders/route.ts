import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin/auth";
import { normalizeOrder } from "@/lib/admin/orders";
import { lastSync } from "@/lib/admin/stripe-sync";

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
            await ref.update({ label_created: true, label_created_at: now, archived: false, updated_at: now });
            break;
        }
        case "mark_shipped": {
            const { trackingProvider, trackingCode } = body as { trackingProvider?: string; trackingCode?: string };
            if (!ref || !trackingProvider || !trackingCode) return NextResponse.json({ error: "Tracking provider and code are required" }, { status: 400 });
            await ref.update({
                label_created: true,
                shipped_out: true,
                shipped: true,
                shipped_at: now,
                tracking_provider: trackingProvider,
                tracking_code: trackingCode.trim(),
                archived: false,
                updated_at: now,
            });
            break;
        }
        case "mark_unfulfilled": {
            if (!ref) return NextResponse.json({ error: "Missing order" }, { status: 400 });
            await ref.update({ label_created: false, shipped_out: false, shipped: false, updated_at: now });
            break;
        }
        case "delete": {
            if (!ref) return NextResponse.json({ error: "Missing order" }, { status: 400 });
            await ref.update({ deleted: true, deleted_at: now, deleted_by: admin.email, updated_at: now });
            break;
        }
        case "create": {
            // Manual order (e.g. sold in person). Amount in euros from the form.
            const d = body.data || {};
            const id = `manual_${Date.now()}`;
            await adminDb.collection("orders").doc(id).set({
                stripe_id: id,
                manual: true,
                amount_total: Math.round(Number(d.amountEuros || 0) * 100),
                customer_email: d.email || "",
                customer_name: d.name || "",
                customer_phone: d.phone || "",
                payment_status: "paid",
                status: "complete",
                created: Math.floor(Date.now() / 1000),
                shipping_details: {
                    name: d.name || "",
                    line1: d.line1 || "",
                    line2: d.line2 || "",
                    city: d.city || "",
                    postal_code: d.postalCode || "",
                    country: d.country || "NL",
                },
                line_items: (d.items || []).map((text: string) => ({ description: text, quantity: 1, amount_total: 0 })),
                locale: d.locale || "tr",
                shipped: false,
                custom_flag: "",
                notes: d.notes || "",
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
