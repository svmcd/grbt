"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addressTooLong, EMAIL_TYPE_LABEL, type AdminOrder } from "@/lib/admin/orders";
import { countryName, formatDateTime, languageName, money } from "@/lib/admin/format";
import { customerKey } from "@/lib/admin/metrics";
import { useAdmin } from "../AdminProvider";
import { shippingCountries } from "@/lib/shipping";
import { Badge, Button, Card, CopyIcon, Field, inputClass, selectClass, textareaClass } from "../ui";

/* ---------- Customer ---------- */

export function CustomerCard({ order, otherOrders }: { order: AdminOrder; otherOrders: AdminOrder[] }) {
    const { orderAction, toast } = useAdmin();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [busy, setBusy] = useState(false);
    const c = order.customer;
    const key = customerKey(c.email, c.name || order.shipping.name);
    const spent = [order, ...otherOrders].reduce((s, o) => s + o.netAmount, 0);

    const startEdit = () => {
        setForm({ name: c.name, email: c.email, phone: c.phone });
        setEditing(true);
    };
    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        try {
            await orderAction("update", order.id, { data: { customer_name: form.name.trim(), customer_email: form.email.trim(), customer_phone: form.phone.trim() } });
            setEditing(false);
            toast("Customer details saved.");
        } catch (err) {
            toast(err instanceof Error ? err.message : "Could not save", "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card
            title="Customer"
            action={
                !editing && (
                    <button onClick={startEdit} className="text-[13px] font-medium text-zinc-700 hover:text-zinc-900">
                        Edit
                    </button>
                )
            }
        >
            {editing ? (
                <form onSubmit={save} className="space-y-3 px-4 pb-4 pt-3 sm:px-5">
                    <Field label="Name">
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Email">
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Phone">
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                    </Field>
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary" size="sm" loading={busy}>
                            Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-2.5 px-4 pb-4 pt-3 text-sm sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/admin/customers/${key}`} className="font-medium text-zinc-900 hover:underline">
                            {c.name || order.shipping.name || "No name"}
                        </Link>
                        {otherOrders.length > 0 && <Badge tone="green">Returning customer</Badge>}
                    </div>
                    <p className="text-[13px] text-zinc-700">
                        {otherOrders.length ? `${otherOrders.length + 1} orders · ${money(spent)} spent` : "First order"}
                    </p>
                    <div className="space-y-1 border-t border-zinc-100 pt-2.5">
                        {c.email ? (
                            <a href={`mailto:${c.email}`} className="block break-all text-zinc-900 underline-offset-2 hover:underline">
                                {c.email}
                            </a>
                        ) : (
                            <p className="text-zinc-600">No email</p>
                        )}
                        {c.phone ? (
                            <a href={`tel:${c.phone}`} className="block text-zinc-900 underline-offset-2 hover:underline">
                                {c.phone}
                            </a>
                        ) : (
                            <p className="text-zinc-600">No phone number</p>
                        )}
                        <p className="text-zinc-700">Language: {languageName(order.locale)}</p>
                    </div>
                </div>
            )}
        </Card>
    );
}

/* ---------- Shipping address ---------- */

export function addressLines(o: AdminOrder) {
    const s = o.shipping;
    return [s.name || o.customer.name, s.line1, s.line2, [s.postalCode, s.city].filter(Boolean).join(" "), s.country ? countryName(s.country) : ""].filter(Boolean);
}

type AddressForm = { name: string; line1: string; line2: string; postalCode: string; city: string; country: string; phone: string };

function AddressEditor({ order, onDone }: { order: AdminOrder; onDone: () => void }) {
    const { orderAction, toast } = useAdmin();
    const s = order.shipping;
    const [form, setForm] = useState<AddressForm>({
        name: s.name || order.customer.name,
        line1: s.line1,
        line2: s.line2,
        postalCode: s.postalCode,
        city: s.city,
        // No country on the order: the admin picks one (never a silent default)
        country: (s.country || "").toUpperCase(),
        phone: s.phone || order.customer.phone,
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const set = (k: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [k]: e.target.value });
        setError(null);
    };
    // Keep a country the shop no longer ships to selectable, so saving does not change it silently
    const codes = shippingCountries.map((c) => c.code);
    const countries = !form.country || codes.includes(form.country) ? codes : [form.country, ...codes];

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        // Too long is refused, not cut: a shortened street would end up on the label
        const tooLong = addressTooLong(form);
        if (tooLong) {
            setError(tooLong);
            return;
        }
        setBusy(true);
        try {
            await orderAction("update_address", order.id, { address: form });
            toast(order.fulfillment.status === "unfulfilled" ? "Address saved." : "Address saved. Check the label: it may still have the old address.");
            onDone();
        } catch (err) {
            toast(err instanceof Error ? err.message : "Could not save the address", "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={save} className="grid gap-3 px-4 pb-4 pt-3 sm:grid-cols-2 sm:px-5">
            <Field label="Name" className="sm:col-span-2">
                <input type="text" required value={form.name} onChange={set("name")} className={inputClass} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
                <input type="text" required value={form.line1} onChange={set("line1")} placeholder="Street and house number" className={inputClass} />
            </Field>
            <Field label="Apartment, suite (optional)" className="sm:col-span-2">
                <input type="text" value={form.line2} onChange={set("line2")} className={inputClass} />
            </Field>
            <Field label="Postal code">
                <input type="text" value={form.postalCode} onChange={set("postalCode")} className={inputClass} />
            </Field>
            <Field label="City">
                <input type="text" required value={form.city} onChange={set("city")} className={inputClass} />
            </Field>
            <Field label="Country" className="sm:col-span-2">
                <select value={form.country} onChange={set("country")} required className={selectClass}>
                    <option value="" disabled>
                        Choose a country
                    </option>
                    {countries.map((c) => (
                        <option key={c} value={c}>
                            {countryName(c)}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Phone" className="sm:col-span-2">
                <input type="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
            </Field>
            {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2">
                    {error}
                </p>
            )}
            <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" variant="primary" size="sm" loading={busy}>
                    Save address
                </Button>
                <Button size="sm" variant="ghost" onClick={onDone}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export function AddressCard({ order }: { order: AdminOrder }) {
    const { toast } = useAdmin();
    const [editing, setEditing] = useState(false);
    const lines = addressLines(order);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(lines.join("\n"));
            toast("Address copied.");
        } catch {
            toast("Could not copy. Select the address and copy it by hand.", "error");
        }
    };
    return (
        <Card
            title="Shipping address"
            action={
                !editing && (
                    <span className="flex items-center gap-3">
                        {lines.length > 0 && (
                            <button onClick={copy} className="inline-flex items-center gap-1 text-[13px] font-medium text-zinc-700 hover:text-zinc-900">
                                <CopyIcon className="h-4 w-4" />
                                Copy
                            </button>
                        )}
                        <button onClick={() => setEditing(true)} className="text-[13px] font-medium text-zinc-700 hover:text-zinc-900">
                            Edit
                        </button>
                    </span>
                )
            }
        >
            {editing ? (
                <AddressEditor order={order} onDone={() => setEditing(false)} />
            ) : (
                <div className="px-4 pb-4 pt-3 text-sm leading-6 text-zinc-900 sm:px-5">
                    {lines.length ? lines.map((l, i) => <p key={i}>{l}</p>) : <p className="text-zinc-600">No shipping address</p>}
                    {order.shipping.phone && <p className="text-zinc-700">{order.shipping.phone}</p>}
                </div>
            )}
        </Card>
    );
}

/* ---------- Notes and tag ---------- */

export function NotesCard({ order }: { order: AdminOrder }) {
    const { orderAction, toast } = useAdmin();
    const [notes, setNotes] = useState(order.notes);
    const [flag, setFlag] = useState(order.flag);
    const [busy, setBusy] = useState(false);
    useEffect(() => setNotes(order.notes), [order.notes]);
    useEffect(() => setFlag(order.flag), [order.flag]);
    const dirty = notes !== order.notes || flag.trim() !== order.flag;

    const save = async () => {
        setBusy(true);
        try {
            await orderAction("update", order.id, { data: { notes, custom_flag: flag.trim() } });
            toast("Saved.");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not save", "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card title="Notes">
            <div className="space-y-3 px-4 pb-4 pt-3 sm:px-5">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes, not shown to the customer"
                    className={textareaClass}
                />
                <Field label="Tag" hint="Short label shown in the order list, e.g. “Waiting for size”">
                    <input type="text" value={flag} maxLength={40} onChange={(e) => setFlag(e.target.value)} className={inputClass} />
                </Field>
                <div className="flex items-center gap-3">
                    <Button variant="primary" size="sm" disabled={!dirty} loading={busy} onClick={save}>
                        Save
                    </Button>
                    {dirty && <span className="text-xs text-amber-800">Unsaved changes</span>}
                </div>
            </div>
        </Card>
    );
}

/* ---------- Timeline ---------- */

export function Timeline({ order }: { order: AdminOrder }) {
    type Event = { at: number; title: string; detail?: string };
    const events: Event[] = [{ at: order.created * 1000, title: order.manual ? "Order created manually" : "Order placed", detail: money(order.amountTotal) }];
    const f = order.fulfillment;
    if (f.labelCreatedAt) events.push({ at: new Date(f.labelCreatedAt).getTime(), title: "Label created" });
    if (f.shippedAt)
        events.push({ at: new Date(f.shippedAt).getTime(), title: "Shipped", detail: [f.trackingProvider, f.trackingCode].filter(Boolean).join(" ") || undefined });
    for (const r of order.payment.refunds) if (r.created) events.push({ at: r.created * 1000, title: "Refunded", detail: money(r.amount) });
    for (const m of order.emails)
        events.push({
            at: new Date(m.at).getTime(),
            title: `${EMAIL_TYPE_LABEL[m.type] || "Email"} ${m.resend ? "resent" : "sent"}`,
            detail: `to ${m.to}${m.by ? ` · by ${m.by}` : ""}`,
        });
    for (const a of order.activity)
        events.push({ at: new Date(a.at).getTime(), title: a.title, detail: [a.detail, a.by && `by ${a.by}`].filter(Boolean).join(" · ") || undefined });
    events.sort((a, b) => b.at - a.at);
    const missing = (f.status !== "unfulfilled" && !f.labelCreatedAt) || (f.status === "shipped" && !f.shippedAt);

    return (
        <Card title="Timeline">
            <ol className="px-4 pb-4 pt-3 sm:px-5">
                {events.map((e, i) => (
                    <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < events.length - 1 && <span className="absolute left-[5px] top-3 h-full w-px bg-zinc-200" />}
                        <span className="relative mt-1.5 h-[11px] w-[11px] flex-shrink-0 rounded-full border-2 border-paper bg-zinc-500 ring-1 ring-zinc-300" />
                        <div className="min-w-0 text-sm">
                            <p className="font-medium text-zinc-900">
                                {e.title}
                                {e.detail && <span className="font-normal text-zinc-700"> · {e.detail}</span>}
                            </p>
                            <p className="text-xs text-zinc-600">{formatDateTime(e.at / 1000)}</p>
                        </div>
                    </li>
                ))}
            </ol>
            {missing && <p className="border-t border-zinc-100 px-4 py-2.5 text-xs text-zinc-600 sm:px-5">Older orders have no recorded label or shipping time.</p>}
        </Card>
    );
}
