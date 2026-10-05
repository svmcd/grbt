// One clean order shape for the admin, built from the Firestore documents (which carry
// several historical formats: Stripe line items, "GRBT Order" summaries, manual orders).

export type PaymentStatus = "paid" | "partially_refunded" | "refunded" | "unpaid";
export type FulfillmentStatus = "unfulfilled" | "label_created" | "shipped";

export type AdminOrderItem = {
    title: string; // e.g. "Konya"
    productType: string; // "T-shirt" | "Hoodie" | "Sweater" | "Phone case" | ""
    color: string; // "Black" | "White" | raw
    size: string;
    quantity: number;
    unitAmount: number; // cents
    totalAmount: number; // cents, after discounts
    personalization?: { method: string; text: string; placement: string; font: string; color: string };
    gift?: { message?: string };
    raw: string; // the stored description, as a fallback
};

export type AdminRefund = { id: string; amount: number; created: number; reason: string | null; status: string };

export type AdminOrder = {
    id: string;
    number: string; // short display number
    created: number; // unix seconds
    customer: { email: string; name: string; phone: string };
    shipping: { name: string; line1: string; line2: string; city: string; postalCode: string; country: string };
    locale: string;
    items: AdminOrderItem[];
    itemCount: number;
    amountTotal: number; // cents, what the customer paid
    amountShipping: number | null;
    amountDiscount: number | null;
    currency: string;
    payment: { status: PaymentStatus; refundedAmount: number; refunds: AdminRefund[] };
    netAmount: number; // amountTotal - refunds
    fulfillment: {
        status: FulfillmentStatus;
        labelCreatedAt: string | null;
        shippedAt: string | null;
        trackingProvider: string | null;
        trackingCode: string | null;
        trackingUrl: string | null;
    };
    notes: string;
    flag: string;
    manual: boolean;
    importedFromStripe: boolean;
    archived: boolean; // kept out of the to-do queues (e.g. old imported orders)
    stripeUrl: string | null;
    syncedAt: string | null;
};

const TYPE_LABELS: Record<string, string> = {
    tişört: "T-shirt",
    tshirt: "T-shirt",
    "t-shirt": "T-shirt",
    hoodie: "Hoodie",
    sweater: "Sweater",
    "telefon kılıfı": "Phone case",
    phonecase: "Phone case",
};
const COLOR_LABELS: Record<string, string> = { siyah: "Black", beyaz: "White", black: "Black", white: "White" };

const typeLabel = (t: string) => TYPE_LABELS[t.trim().toLowerCase()] ?? t.trim();
const colorLabel = (c: string) => COLOR_LABELS[c.trim().toLowerCase()] ?? c.trim();

// "Konya Tişört - siyah, M - Baskı: "Ali" - arka - Font: Serif - Renk: #fff - Hediye Mesajı: "..."
function parseDescription(desc: string): Partial<AdminOrderItem> {
    const out: Partial<AdminOrderItem> = {};
    const parts = desc.split(" - ");
    const head = parts.shift() || "";
    const typeMatch = head.match(/^(.*?)\s+(Tişört|Hoodie|Sweater|Telefon Kılıfı)$/i);
    if (typeMatch) {
        out.title = typeMatch[1].trim();
        out.productType = typeLabel(typeMatch[2]);
    } else {
        out.title = head.trim();
    }
    const variant = parts.shift();
    if (variant) {
        if (out.productType === "Phone case") {
            out.size = variant.trim();
        } else {
            const [color, size] = variant.split(",").map((s) => s.trim());
            if (color) out.color = colorLabel(color);
            if (size) out.size = size;
        }
    }
    for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const pers = p.match(/^(Baskı|İşleme|Printed|Embroidered):\s*"(.*)"$/);
        if (pers) {
            const placement = (parts[i + 1] || "").trim();
            const font = (parts[i + 2] || "").replace(/^Font:\s*/, "").trim();
            const color = (parts[i + 3] || "").replace(/^Renk:\s*/, "").trim();
            out.personalization = {
                method: /Baskı|Printed/.test(pers[1]) ? "Printed" : "Embroidered",
                text: pers[2],
                placement,
                font,
                color,
            };
            i += 3;
            continue;
        }
        const giftMsg = p.match(/^Hediye Mesajı:\s*"(.*)"$/);
        if (giftMsg) {
            out.gift = { message: giftMsg[1] };
            continue;
        }
        if (/^Hediye Paketi$/.test(p.trim())) out.gift = {};
    }
    return out;
}

// Short English label for a stored item description (also used for abandoned checkout lines),
// e.g. "Kayseri T-shirt · Black · M · Personalized · Gift"
export function itemLabel(desc: string): string {
    const p = parseDescription(desc);
    if (!p.title || (!p.productType && !p.color && !p.size)) return desc;
    return [
        [p.title, p.productType].filter(Boolean).join(" "),
        p.color,
        p.size,
        p.personalization && "Personalized",
        p.gift && "Gift",
    ]
        .filter(Boolean)
        .join(" · ");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Old "GRBT Order" summaries can list several items: "Items: Konya Tişört (siyah, M), Rize Tişört (siyah, L)"
function expandSummaryItems(li: any): any[] {
    const desc: string | undefined = li.product_details?.description;
    if ((li.description || li.product_details?.name) !== "GRBT Order" || !desc) return [li];
    const matches = [...desc.matchAll(/([^,:]+?)\s+(Tişört|Hoodie|Sweater)\s*\(([^,]+),\s*([^)]+)\)/gi)];
    if (matches.length <= 1) return [li];
    const total = Number(li.amount_total ?? li.amount ?? 0);
    return matches.map((m, i) => ({
        description: `${m[1].trim()} ${m[2]} - ${m[3].trim()}, ${m[4].trim()}`,
        quantity: 1,
        // spread the paid amount; the last item takes the rounding remainder
        amount_total: i === matches.length - 1 ? total - Math.floor(total / matches.length) * (matches.length - 1) : Math.floor(total / matches.length),
    }));
}

function normalizeItem(li: any): AdminOrderItem {
    const quantity = Number(li.quantity) || 1;
    const totalAmount = Number(li.amount_total ?? li.amount ?? 0);
    const subtotal = Number(li.amount_subtotal ?? totalAmount);
    const unitAmount = Number(li.price?.unit_amount ?? Math.round(subtotal / quantity));
    let raw: string = li.description || li.product_details?.name || "";
    let parsed: Partial<AdminOrderItem> = {};

    const pd = li.product_details;
    if (raw === "GRBT Order" && pd?.description) {
        // Old summary: "Items: Trabzon Tişört (siyah, L)"
        const m = pd.description.match(/Items:\s*([^(]+?)\s+(Tişört|Hoodie|Sweater)\s*\(([^,]+),\s*([^)]+)\)/i);
        raw = pd.description;
        if (m) parsed = { title: m[1].trim(), productType: typeLabel(m[2]), color: colorLabel(m[3]), size: m[4].trim() };
        else parsed = { title: pd.description.replace(/^Items:\s*/, "") };
    } else if (pd?.name && pd?.description && pd.description.includes("•")) {
        // Old format: name "Aksaray", description "siyah • S"
        const [color, size] = pd.description.split("•").map((s: string) => s.trim());
        parsed = { title: pd.name, productType: "T-shirt", color: colorLabel(color), size };
        raw = `${pd.name} ${pd.description}`;
    } else {
        parsed = parseDescription(raw);
    }

    return {
        title: parsed.title || raw || "Item",
        productType: parsed.productType || "",
        color: parsed.color || "",
        size: parsed.size || "",
        quantity,
        unitAmount,
        totalAmount,
        personalization: parsed.personalization,
        gift: parsed.gift,
        raw,
    };
}

export function trackingUrl(provider: string | null | undefined, code: string | null | undefined, country?: string, postalCode?: string) {
    if (!provider || !code) return null;
    if (provider === "DHL") return `https://www.dhl.com/content/gb/en/express/tracking.html?AWB=${encodeURIComponent(code)}`;
    if (provider === "PostNL")
        return `https://jouw.postnl.nl/track-and-trace/${encodeURIComponent(code)}-${country || "NL"}-${(postalCode || "").replace(/\s+/g, "")}`;
    return null;
}

export function normalizeOrder(id: string, o: any): AdminOrder {
    const ship = o.shipping_details || {};
    const addr = ship.address || ship; // both shapes exist
    const items = (o.line_items || []).flatMap(expandSummaryItems).map(normalizeItem);
    const refunds: AdminRefund[] = (o.stripe_refunds || []).map((r: any) => ({
        id: r.id,
        amount: Number(r.amount) || 0,
        created: Number(r.created) || 0,
        reason: r.reason ?? null,
        status: r.status || "succeeded",
    }));
    const refundedAmount = Number(o.refunded_amount ?? refunds.filter((r) => r.status === "succeeded").reduce((s, r) => s + r.amount, 0)) || 0;
    const amountTotal = Number(o.amount_total) || 0;

    let paymentStatus: PaymentStatus = o.payment_status === "paid" || o.payment_status === "complete" ? "paid" : "unpaid";
    if (refundedAmount > 0) paymentStatus = refundedAmount >= amountTotal ? "refunded" : "partially_refunded";

    const shipped = Boolean(o.shipped_out || o.shipped);
    const fulfillmentStatus: FulfillmentStatus = shipped ? "shipped" : o.label_created ? "label_created" : "unfulfilled";
    const postalCode = addr.postal_code || "";
    const country = addr.country || "";
    const isStripe = typeof (o.stripe_id || id) === "string" && String(o.stripe_id || id).startsWith("cs_");

    return {
        id,
        number: (o.stripe_id || id).slice(-8).toUpperCase(),
        created: Number(o.created) || Math.floor(new Date(o.created_at || 0).getTime() / 1000),
        customer: {
            email: o.customer_email || "",
            name: o.customer_name || ship.name || "",
            phone: o.customer_phone || "",
        },
        shipping: {
            name: ship.name || o.customer_name || "",
            line1: addr.line1 || "",
            line2: addr.line2 || "",
            city: addr.city || "",
            postalCode,
            country,
        },
        locale: o.locale || "tr",
        items,
        itemCount: items.reduce((s: number, i: AdminOrderItem) => s + i.quantity, 0),
        amountTotal,
        amountShipping: o.amount_shipping ?? null,
        amountDiscount: o.amount_discount ?? null,
        currency: o.currency || "eur",
        payment: { status: paymentStatus, refundedAmount, refunds },
        netAmount: Math.max(0, amountTotal - refundedAmount),
        fulfillment: {
            status: fulfillmentStatus,
            labelCreatedAt: o.label_created_at || null,
            shippedAt: o.shipped_at || null,
            trackingProvider: o.tracking_provider || null,
            trackingCode: o.tracking_code || null,
            trackingUrl: trackingUrl(o.tracking_provider, o.tracking_code, country, postalCode),
        },
        notes: o.notes || "",
        flag: o.custom_flag || "",
        manual: Boolean(o.manual),
        importedFromStripe: Boolean(o.imported_from_stripe),
        archived: Boolean(o.archived),
        stripeUrl: isStripe && o.payment_intent ? `https://dashboard.stripe.com/payments/${o.payment_intent}` : null,
        syncedAt: o.stripe_synced_at || null,
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
