"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdmin } from "../../_components/AdminProvider";
import { Button, Card, Field, PageHeader, PlusIcon, inputClass, selectClass, textareaClass } from "../../_components/ui";
import { adminFetch } from "@/lib/admin/client";
import { countryName, money } from "@/lib/admin/format";
import { cloprodColorFor, colorsFor, hasretSlugs, memleketSlugs, productTypesFor, recepIvedikSlugs, titleCaseCity, turkishTimeSlugs } from "@/lib/catalog";
import { GARMENT_SURCHARGE_EUR } from "@/lib/cart-pricing";
import { colorName } from "@/lib/garments";
import { getPriceForSlug } from "@/lib/pricing";
import { shippingCountries } from "@/lib/shipping";

const EMPTY = { name: "", email: "", phone: "", line1: "", line2: "", postalCode: "", city: "", country: "NL", shippingEuros: "0", discountEuros: "", notes: "", locale: "tr" };

type ProductType = "tshirt" | "longsleeve" | "hoodie" | "sweater";
type Line = { slug: string; productType: ProductType; color: string; size: string; quantity: string; unitPrice: string };

const DESIGNS = [
    { label: "Memleket", slugs: memleketSlugs },
    { label: "Hasret", slugs: hasretSlugs },
    { label: "Sinema", slugs: recepIvedikSlugs },
    { label: "Turkish Time", slugs: turkishTimeSlugs },
];
const TYPES: { value: ProductType; label: string }[] = [
    { value: "tshirt", label: "T-shirt" },
    { value: "longsleeve", label: "Long Sleeve" },
    { value: "hoodie", label: "Hoodie" },
    { value: "sweater", label: "Sweater" },
];
const SIZES = ["S", "M", "L", "XL", "XXL"];
// Same prices as the shop: the design's price plus the garment surcharge (cart-pricing.ts)
const shopPrice = (slug: string, type: ProductType) => (slug ? getPriceForSlug(slug) + GARMENT_SURCHARGE_EUR[type] : 0);
// Types sold for the design (Turkish Time: T-shirt and long sleeve only); every type before a design is picked
const typesFor = (slug: string) => TYPES.filter((t) => !slug || productTypesFor(slug).includes(t.value));
const euros = (v: string) => Number(v.replace(",", "."));
const newLine = (): Line => ({ slug: "", productType: "tshirt", color: "siyah", size: "M", quantity: "1", unitPrice: "" });

// Orders sold outside the site (in person, by message). Saved as paid. Items are picked from the
// catalog so they show up in analytics like shop orders.
export default function NewOrderPage() {
    const router = useRouter();
    const { reload, toast } = useAdmin();
    const [form, setForm] = useState(EMPTY);
    const [lines, setLines] = useState<Line[]>([newLine()]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

    const setLine = (i: number, patch: Partial<Line>) =>
        setLines((cur) =>
            cur.map((l, j) => {
                if (j !== i) return l;
                const next = { ...l, ...patch };
                if (next.slug && !productTypesFor(next.slug).includes(next.productType)) next.productType = "tshirt";
                // Colours are per design and type: keep the colour when the new choice has it
                const colors = colorsFor(next.slug, next.productType);
                if (!colors.includes(next.color)) next.color = colors[0];
                // Follow the shop price until the price was typed by hand
                const auto = l.unitPrice === "" || euros(l.unitPrice) === shopPrice(l.slug, l.productType);
                if (auto && (patch.slug !== undefined || patch.productType !== undefined)) next.unitPrice = next.slug ? String(shopPrice(next.slug, next.productType)) : "";
                return next;
            }),
        );

    const subtotal = lines.reduce((s, l) => s + (euros(l.unitPrice) || 0) * (Math.floor(Number(l.quantity)) || 0), 0);
    const shipping = euros(form.shippingEuros) || 0;
    const discount = euros(form.discountEuros) || 0;
    const total = Math.max(0, subtotal - discount) + shipping;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (lines.some((l) => !l.slug)) return setError("Choose a design for every item.");
        if (lines.some((l) => !(Math.floor(Number(l.quantity)) >= 1))) return setError("Every item needs a quantity of at least 1.");
        if (lines.some((l) => l.unitPrice.trim() === "" || !(euros(l.unitPrice) >= 0))) return setError("Enter a price for every item.");
        if (!(shipping >= 0) || !(discount >= 0)) return setError("Check the shipping and discount amounts.");
        setBusy(true);
        try {
            const res = await adminFetch<{ ok: boolean; id: string }>("/api/admin/orders", {
                method: "POST",
                body: {
                    action: "create",
                    data: {
                        ...form,
                        name: form.name.trim(),
                        email: form.email.trim(),
                        shippingEuros: shipping,
                        discountEuros: discount,
                        items: lines.map((l) => ({
                            slug: l.slug,
                            productType: l.productType,
                            color: l.color,
                            size: l.size,
                            quantity: Math.floor(Number(l.quantity)),
                            unitPriceEuros: euros(l.unitPrice),
                        })),
                    },
                },
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
                        <div className="space-y-3 px-4 pb-4 pt-3 sm:px-5">
                            {lines.map((l, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 p-3 sm:grid-cols-6">
                                    <Field label="Design" className="col-span-2 sm:col-span-3">
                                        <select required value={l.slug} onChange={(e) => setLine(i, { slug: e.target.value })} className={selectClass}>
                                            <option value="">Choose a design</option>
                                            {DESIGNS.map((g) => (
                                                <optgroup key={g.label} label={g.label}>
                                                    {g.slugs.map((slug) => (
                                                        <option key={slug} value={slug}>
                                                            {titleCaseCity(slug)}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Product" className="sm:col-span-3">
                                        <select value={l.productType} onChange={(e) => setLine(i, { productType: e.target.value as ProductType })} className={selectClass}>
                                            {typesFor(l.slug).map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Color" className="sm:col-span-2">
                                        <select value={l.color} onChange={(e) => setLine(i, { color: e.target.value })} className={selectClass}>
                                            {colorsFor(l.slug, l.productType).map((key) => {
                                                // Legacy white on a hoodie or sweater is made in Cloprod Cream White
                                                const cloprod = cloprodColorFor(l.productType, key);
                                                const name = colorName(key, "en", l.productType);
                                                return (
                                                    <option key={key} value={key}>
                                                        {cloprod && cloprod.name !== name ? `${name} (${cloprod.name})` : name}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </Field>
                                    <Field label="Size">
                                        <select value={l.size} onChange={(e) => setLine(i, { size: e.target.value })} className={selectClass}>
                                            {SIZES.map((sz) => (
                                                <option key={sz} value={sz}>
                                                    {sz}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Quantity">
                                        <input type="number" min={1} max={99} required value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} className={inputClass} />
                                    </Field>
                                    <Field label="Price each (€)" className="sm:col-span-2">
                                        <input type="text" inputMode="decimal" required value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} placeholder="0.00" className={inputClass} />
                                    </Field>
                                    {lines.length > 1 && (
                                        <div className="col-span-2 sm:col-span-6">
                                            <button type="button" className="text-[13px] font-medium text-red-700 hover:underline" onClick={() => setLines((cur) => cur.filter((_, j) => j !== i))}>
                                                Remove item
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Button size="sm" onClick={() => setLines((cur) => [...cur, newLine()])}>
                                <PlusIcon className="h-4 w-4" />
                                Add item
                            </Button>
                            <div className="grid gap-3 border-t border-zinc-100 pt-3 sm:grid-cols-2">
                                <Field label="Shipping (€)">
                                    <input type="text" inputMode="decimal" value={form.shippingEuros} onChange={set("shippingEuros")} placeholder="0.00" className={inputClass} />
                                </Field>
                                <Field label="Discount (€)" hint="Leave empty for none">
                                    <input type="text" inputMode="decimal" value={form.discountEuros} onChange={set("discountEuros")} placeholder="0.00" className={inputClass} />
                                </Field>
                            </div>
                            <dl className="space-y-1 text-sm">
                                <div className="flex justify-between text-zinc-700">
                                    <dt>Items</dt>
                                    <dd className="tabular-nums">{money(Math.round(subtotal * 100))}</dd>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-zinc-700">
                                        <dt>Discount</dt>
                                        <dd className="tabular-nums">−{money(Math.round(discount * 100))}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between text-zinc-700">
                                    <dt>Shipping</dt>
                                    <dd className="tabular-nums">{money(Math.round(shipping * 100))}</dd>
                                </div>
                                <div className="flex justify-between font-semibold text-zinc-900">
                                    <dt>Amount paid</dt>
                                    <dd className="tabular-nums">{money(Math.round(total * 100))}</dd>
                                </div>
                            </dl>
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
