"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdmin } from "../../_components/AdminProvider";
import { Button, Card, Field, PageHeader, inputClass, selectClass, textareaClass } from "../../_components/ui";
import { adminFetch } from "@/lib/admin/client";
import { countryName } from "@/lib/admin/format";
import { shippingCountries } from "@/lib/shipping";

const EMPTY = { name: "", email: "", phone: "", line1: "", line2: "", postalCode: "", city: "", country: "NL", amountEuros: "", items: "", notes: "", locale: "tr" };

// Orders sold outside the site (in person, by message). Saved as paid.
export default function NewOrderPage() {
    const router = useRouter();
    const { reload, toast } = useAdmin();
    const [form, setForm] = useState(EMPTY);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

    const items = form.items
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    const amount = Number(form.amountEuros.replace(",", "."));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!items.length) return setError("Add at least one item.");
        if (!(amount >= 0) || form.amountEuros.trim() === "") return setError("Enter the amount paid in euros.");
        setBusy(true);
        try {
            const res = await adminFetch<{ ok: boolean; id: string }>("/api/admin/orders", {
                method: "POST",
                body: { action: "create", data: { ...form, amountEuros: amount, items, name: form.name.trim(), email: form.email.trim() } },
            });
            await reload();
            toast("Order created.");
            router.push(`/admin/orders/${res.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create the order");
            setBusy(false);
        }
    };

    return (
        <>
            <PageHeader title="Create order" back={{ href: "/admin/orders", label: "Orders" }} />
            <form onSubmit={submit} className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-4">
                    <Card title="Items">
                        <div className="space-y-4 px-4 pb-4 pt-3 sm:px-5">
                            <Field label="Items" hint="One item per line, e.g. “Konya T-shirt, Black, M”">
                                <textarea rows={4} value={form.items} onChange={set("items")} className={textareaClass} placeholder={"Konya T-shirt, Black, M\nRize Hoodie, Black, L"} />
                            </Field>
                            <Field label="Amount paid (€)" hint="Total including shipping" className="max-w-[200px]">
                                <input type="text" inputMode="decimal" required value={form.amountEuros} onChange={set("amountEuros")} placeholder="0.00" className={inputClass} />
                            </Field>
                        </div>
                    </Card>
                    <Card title="Shipping address">
                        <div className="grid gap-4 px-4 pb-4 pt-3 sm:grid-cols-2 sm:px-5">
                            <Field label="Address" className="sm:col-span-2">
                                <input type="text" value={form.line1} onChange={set("line1")} className={inputClass} placeholder="Street and house number" />
                            </Field>
                            <Field label="Apartment, suite (optional)" className="sm:col-span-2">
                                <input type="text" value={form.line2} onChange={set("line2")} className={inputClass} />
                            </Field>
                            <Field label="Postal code">
                                <input type="text" value={form.postalCode} onChange={set("postalCode")} className={inputClass} />
                            </Field>
                            <Field label="City">
                                <input type="text" value={form.city} onChange={set("city")} className={inputClass} />
                            </Field>
                            <Field label="Country" className="sm:col-span-2">
                                <select value={form.country} onChange={set("country")} className={selectClass}>
                                    {shippingCountries.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {countryName(c.code)}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card title="Customer">
                        <div className="space-y-4 px-4 pb-4 pt-3 sm:px-5">
                            <Field label="Name">
                                <input type="text" required value={form.name} onChange={set("name")} className={inputClass} />
                            </Field>
                            <Field label="Email" hint="Needed to send packing and shipping emails">
                                <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
                            </Field>
                            <Field label="Phone">
                                <input type="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
                            </Field>
                            <Field label="Email language">
                                <select value={form.locale} onChange={set("locale")} className={selectClass}>
                                    <option value="tr">Turkish</option>
                                    <option value="en">English</option>
                                    <option value="de">German</option>
                                    <option value="fr">French</option>
                                </select>
                            </Field>
                        </div>
                    </Card>
                    <Card title="Notes">
                        <div className="px-4 pb-4 pt-3 sm:px-5">
                            <textarea rows={3} value={form.notes} onChange={set("notes")} className={textareaClass} placeholder="Internal notes" />
                        </div>
                    </Card>
                    {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary" loading={busy} className="flex-1">
                            Create order
                        </Button>
                        <Button onClick={() => router.push("/admin/orders")}>Cancel</Button>
                    </div>
                </div>
            </form>
        </>
    );
}
