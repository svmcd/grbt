"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminOrder } from "@/lib/admin/orders";
import { countryName, formatDateTime, languageName, money } from "@/lib/admin/format";
import { customerKey } from "@/lib/admin/metrics";
import { useAdmin } from "../AdminProvider";
import { Badge, Button, Card, CopyIcon, Field, inputClass, textareaClass } from "../ui";

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

export function AddressCard({ order }: { order: AdminOrder }) {
    const { toast } = useAdmin();
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
                lines.length > 0 && (
                    <button onClick={copy} className="inline-flex items-center gap-1 text-[13px] font-medium text-zinc-700 hover:text-zinc-900">
                        <CopyIcon className="h-4 w-4" />
                        Copy address
                    </button>
                )
            }
        >
            <div className="px-4 pb-4 pt-3 text-sm leading-6 text-zinc-900 sm:px-5">
                {lines.length ? lines.map((l, i) => <p key={i}>{l}</p>) : <p className="text-zinc-600">No shipping address</p>}
            </div>
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
