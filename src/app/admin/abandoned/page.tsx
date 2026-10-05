"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, LoadingBlock, MailIcon, PageHeader, Tabs, buttonClass } from "../_components/ui";
import { adminFetch } from "@/lib/admin/client";
import { countryName, formatOrderDate, money } from "@/lib/admin/format";
import { itemLabel } from "@/lib/admin/orders";

// "1× Kayseri Tişört - siyah, M - ..." → "1× Kayseri T-shirt · Black · M"
const lineLabel = (line: string) => {
    const m = line.match(/^(\d+)×\s*(.*)$/);
    return m ? `${m[1]}× ${itemLabel(m[2])}` : itemLabel(line);
};

type Checkout = { id: string; created: number; email: string; name: string; country: string; amountTotal: number; items: string[]; locale: string; recovered: boolean };

const RANGES = [
    { key: "7", label: "7 days" },
    { key: "30", label: "30 days" },
    { key: "90", label: "90 days" },
    { key: "365", label: "12 months" },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

const SUBJECT = "Your eğrikuyu order";

export default function AbandonedPage() {
    const [days, setDays] = useState<RangeKey>("30");
    const [cache, setCache] = useState<Record<string, Checkout[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hideRecovered, setHideRecovered] = useState(false);

    useEffect(() => {
        if (cache[days]) return;
        let cancelled = false;
        setLoading(true);
        setError("");
        adminFetch<{ checkouts: Checkout[] }>(`/api/admin/abandoned?days=${days}`)
            .then((res) => !cancelled && setCache((c) => ({ ...c, [days]: res.checkouts })))
            .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load abandoned checkouts"))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [days, cache]);

    const all = cache[days] || [];
    const list = hideRecovered ? all.filter((c) => !c.recovered) : all;
    const open = all.filter((c) => !c.recovered);
    const mailto = (c: Checkout) => `mailto:${c.email}?subject=${encodeURIComponent(SUBJECT)}`;

    return (
        <>
            <PageHeader
                title="Abandoned checkouts"
                meta={cache[days] && <span className="text-sm text-zinc-700">{open.length} not recovered · {money(open.reduce((s, c) => s + c.amountTotal, 0))}</span>}
            />
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <Tabs tabs={RANGES.map((r) => ({ key: r.key, label: r.label }))} value={days} onChange={setDays} />
                <label className="flex items-center gap-2 text-[13px] text-zinc-800">
                    <input type="checkbox" className="h-4 w-4 accent-zinc-900" checked={hideRecovered} onChange={(e) => setHideRecovered(e.target.checked)} />
                    Hide recovered
                </label>
            </div>
            <Card>
                <p className="border-b border-zinc-200 px-4 py-2.5 text-xs text-zinc-700">
                    Stripe checkouts that expired without payment but left an email. “Recovered” means the same email paid later.
                </p>
                {loading && !cache[days] ? (
                    <LoadingBlock label="Loading checkouts from Stripe, this can take a few seconds" />
                ) : error ? (
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm text-red-800">{error}</p>
                        <Button className="mt-3" size="sm" onClick={() => setCache((c) => ({ ...c }))}>
                            Try again
                        </Button>
                    </div>
                ) : !list.length ? (
                    <EmptyState title="No abandoned checkouts in this period" />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-700">
                                        <th className="px-4 py-2 font-medium">Date</th>
                                        <th className="px-3 py-2 font-medium">Customer</th>
                                        <th className="px-3 py-2 font-medium">Country</th>
                                        <th className="px-3 py-2 font-medium">Items</th>
                                        <th className="px-3 py-2 text-right font-medium">Value</th>
                                        <th className="px-3 py-2 font-medium">Status</th>
                                        <th className="px-3 py-2 pr-4" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {list.map((c) => (
                                        <tr key={c.id}>
                                            <td className="whitespace-nowrap px-4 py-2.5 text-zinc-800">{formatOrderDate(c.created)}</td>
                                            <td className="max-w-[220px] px-3 py-2.5">
                                                <p className="truncate text-zinc-900">{c.name || c.email}</p>
                                                {c.name && <p className="truncate text-xs text-zinc-600">{c.email}</p>}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-zinc-800">{c.country ? countryName(c.country) : "–"}</td>
                                            <td className="max-w-[280px] px-3 py-2.5 text-zinc-800">
                                                <p className="line-clamp-2">{c.items.map(lineLabel).join(", ") || "–"}</p>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-zinc-900">{money(c.amountTotal)}</td>
                                            <td className="px-3 py-2.5">{c.recovered ? <Badge tone="green">Recovered</Badge> : <Badge tone="amber">Not recovered</Badge>}</td>
                                            <td className="px-3 py-2.5 pr-4 text-right">
                                                <a href={mailto(c)} className={buttonClass("secondary", "sm")}>
                                                    <MailIcon className="h-4 w-4" />
                                                    Email
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <ul className="divide-y divide-zinc-100 md:hidden">
                            {list.map((c) => (
                                <li key={c.id} className="px-3 py-3">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="truncate text-sm font-medium text-zinc-900">{c.name || c.email}</span>
                                        <span className="text-sm font-medium tabular-nums text-zinc-900">{money(c.amountTotal)}</span>
                                    </div>
                                    {c.name && <p className="truncate text-[13px] text-zinc-700">{c.email}</p>}
                                    <p className="mt-1 text-[13px] text-zinc-800">{c.items.map(lineLabel).join(", ")}</p>
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-2 text-xs text-zinc-600">
                                            {c.recovered ? <Badge tone="green">Recovered</Badge> : <Badge tone="amber">Not recovered</Badge>}
                                            {formatOrderDate(c.created)}
                                            {c.country && ` · ${c.country}`}
                                        </span>
                                        <a href={mailto(c)} className={buttonClass("secondary", "sm")}>
                                            <MailIcon className="h-4 w-4" />
                                            Email
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </Card>
        </>
    );
}
