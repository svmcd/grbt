"use client";

import { useMemo, useState } from "react";
import { BarChart } from "../_components/BarChart";
import { Badge, Card, EmptyState, LoadingBlock, PageHeader, Tabs, cx } from "../_components/ui";
import { useTraffic, type TrafficData, type TrafficDays } from "../_components/useTraffic";
import { countryName, formatDate, languageName, money } from "@/lib/admin/format";
import type { Bucket } from "@/lib/admin/metrics";

const RANGES: { key: string; label: string }[] = [
    { key: "7", label: "7 days" },
    { key: "30", label: "30 days" },
    { key: "90", label: "90 days" },
    { key: "365", label: "12 months" },
];

const pct = (part: number, whole: number, digits = 1) => (whole > 0 ? `${((part / whole) * 100).toFixed(digits)}%` : "–");
const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function TrafficPage() {
    const [range, setRange] = useState("30");
    const days = Number(range) as TrafficDays;
    const { status, data, error } = useTraffic(days);

    return (
        <>
            <PageHeader
                title="Traffic"
                meta={data?.since && <span className="text-sm text-zinc-700">Tracking since {formatDate(data.since)}</span>}
            />
            <div className="mb-4">
                <Tabs tabs={RANGES} value={range} onChange={setRange} />
            </div>
            {status === "loading" ? (
                <Card>
                    <LoadingBlock label="Loading traffic" />
                </Card>
            ) : status === "error" ? (
                <Card>
                    <EmptyState title="Traffic could not be loaded">{error}</EmptyState>
                </Card>
            ) : status === "missing" || !data ? (
                <Card>
                    <EmptyState title="No traffic data yet">
                        Tracking started — data appears after the first visits on egrikuyu.com (local visits are not counted).
                    </EmptyState>
                </Card>
            ) : (
                <TrafficReport data={data} days={days} />
            )}
            <p className="mt-4 text-xs text-zinc-600">Privacy friendly: no cookies, visitors counted with an anonymous daily ID.</p>
        </>
    );
}

function TrafficReport({ data, days }: { data: TrafficData; days: TrafficDays }) {
    const t = data.totals;
    const buckets = useMemo(() => dayBuckets(data, days), [data, days]);
    const byKey = useMemo(() => new Map(buckets.map((b) => [b.key, b])), [buckets]);

    const funnel = [
        { label: "Visitors", value: t.visitors },
        { label: "Viewed a product", value: t.productViewers },
        { label: "Added to cart", value: t.cartVisitors },
        { label: "Started checkout", value: t.checkoutVisitors },
        { label: "Purchased", value: t.purchasers },
    ];

    return (
        <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Kpi label="Visitors" value={t.visitors.toLocaleString("en-GB")} detail={`${t.pageviews.toLocaleString("en-GB")} page views`} />
                <Kpi label="Conversion rate" value={pct(t.purchasers, t.visitors)} detail={`${t.purchasers} of ${t.visitors} visitors bought`} />
                <Kpi label="Add-to-cart rate" value={pct(t.cartVisitors, t.visitors)} detail={`${t.cartVisitors} visitors added to cart`} />
                <Kpi
                    label="Checkout abandonment"
                    value={t.checkoutVisitors ? pct(t.checkoutVisitors - t.purchasers, t.checkoutVisitors) : "–"}
                    detail={`${Math.max(0, t.checkoutVisitors - t.purchasers)} of ${t.checkoutVisitors} left checkout`}
                />
                <Kpi label="Revenue per visitor" value={t.visitors ? money(Math.round(t.revenue / t.visitors)) : "–"} detail={`${money(t.revenue)} tracked revenue`} />
            </div>

            <div className="mb-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <Card title="Funnel">
                    <Funnel steps={funnel} />
                </Card>
                <Card title={days === 365 ? "Visitors per month" : "Visitors per day"}>
                    <div className="px-2 pb-3 pt-2 sm:px-4">
                        <BarChart
                            buckets={buckets}
                            emptyLabel="No visitors in this period"
                            ariaLabel="Visitors chart"
                            formatAxis={(v) => v.toLocaleString("en-GB")}
                            formatTooltip={(b) => {
                                const pv = byKey.get(b.key)?.orders ?? 0;
                                return `${b.value} visitor${b.value === 1 ? "" : "s"} · ${pv} page view${pv === 1 ? "" : "s"}`;
                            }}
                        />
                    </div>
                </Card>
            </div>

            <Card className="mb-4" title="Products">
                <ProductTable products={data.products} />
            </Card>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                    <Card title="Sources">
                        <Share rows={data.sources.map((r) => ({ label: r.source || "Direct", value: r.visitors }))} unit="visitors" />
                    </Card>
                    <Card title="Devices">
                        <Share rows={data.devices.map((r) => ({ label: r.device ? r.device[0].toUpperCase() + r.device.slice(1) : "Unknown", value: r.visitors }))} unit="visitors" />
                    </Card>
                    <Card title="Languages">
                        <Share rows={data.languages.map((r) => ({ label: languageName(r.language), value: r.visitors }))} unit="visitors" />
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card title="Countries">
                        <Share rows={data.countries.map((r) => ({ label: r.country ? countryName(r.country) : "Unknown", value: r.visitors }))} unit="visitors" />
                    </Card>
                    <Card title="Top pages">
                        <Share rows={data.pages.slice(0, 15).map((r) => ({ label: r.path, value: r.views, mono: true }))} unit="views" />
                    </Card>
                </div>
            </div>
        </>
    );
}

// Visitors per day (per month for 12 months), from the first tracked day; days without visits count as 0
function dayBuckets(data: TrafficData, days: TrafficDays): Bucket[] {
    const map = new Map(data.days.map((d) => [d.date, d]));
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1));
    if (data.since) {
        const s = new Date(`${data.since.slice(0, 10)}T00:00:00`);
        if (s > start) start = s;
    }
    const out: Bucket[] = [];
    const monthly = days === 365;
    const index = new Map<string, Bucket>();
    for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
        const key = monthly ? `${d.getFullYear()}-${d.getMonth()}` : isoDay(d);
        let b = index.get(key);
        if (!b) {
            b = {
                key,
                label: monthly ? d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
                longLabel: monthly
                    ? d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                    : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }),
                value: 0,
                orders: 0, // page views (shown in the tooltip)
            };
            index.set(key, b);
            out.push(b);
        }
        const day = map.get(isoDay(d));
        if (day) {
            b.value += day.visitors;
            b.orders += day.pageviews;
        }
    }
    return out;
}

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <Card className="px-4 py-3.5">
            <p className="text-[13px] font-medium text-zinc-700">{label}</p>
            <p className="mt-1 text-[22px] font-semibold leading-tight tracking-tight tabular-nums text-zinc-900">{value}</p>
            <p className="mt-1 text-xs leading-snug text-zinc-600">{detail}</p>
        </Card>
    );
}

function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
    const top = steps[0]?.value || 0;
    return (
        <ol className="space-y-3 px-4 pb-4 pt-3 sm:px-5">
            {steps.map((s, i) => {
                const prev = i > 0 ? steps[i - 1].value : null;
                return (
                    <li key={s.label}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="font-medium text-zinc-900">
                                {i + 1}. {s.label}
                            </span>
                            <span className="tabular-nums text-zinc-900">
                                {s.value.toLocaleString("en-GB")}
                                <span className="ml-2 inline-block w-14 text-right text-xs text-zinc-600">{i === 0 ? "100%" : pct(s.value, top)}</span>
                            </span>
                        </div>
                        <div className="mt-1.5 h-6 rounded-md bg-zinc-100">
                            <div className="h-6 rounded-md bg-zinc-700" style={{ width: `${top ? Math.max((s.value / top) * 100, s.value ? 1 : 0) : 0}%` }} />
                        </div>
                        {prev !== null && (
                            <p className="mt-1 text-xs text-zinc-600">
                                {pct(s.value, prev)} of the previous step
                                {prev > s.value && ` · ${(prev - s.value).toLocaleString("en-GB")} dropped off`}
                            </p>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function ProductTable({ products }: { products: TrafficData["products"] }) {
    if (!products.length) return <EmptyState title="No product views yet" />;
    const totalViews = products.reduce((s, p) => s + p.views, 0);
    const totalAdds = products.reduce((s, p) => s + p.addToCart, 0);
    const avgRate = totalViews ? totalAdds / totalViews : 0;
    const sortedViews = [...products].map((p) => p.views).sort((a, b) => a - b);
    const median = sortedViews[Math.floor(sortedViews.length / 2)] || 0;
    // Many views (median or more, at least 10) but adds to cart at under half the shop's average rate
    const flagged = (p: TrafficData["products"][number]) => p.views >= Math.max(10, median) && p.addToCart / p.views < avgRate / 2;

    return (
        <>
            <p className="px-4 pt-1 text-xs text-zinc-600 sm:px-5">
                Average add-to-cart rate {pct(totalAdds, totalViews)}. <Badge tone="amber">Many views, few adds</Badge> marks well-viewed products that are added to cart at less
                than half that rate.
            </p>
            <div className="mt-3 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                        <tr className="border-y border-zinc-200 bg-zinc-50 text-xs text-zinc-700">
                            <th className="px-4 py-2 font-medium">Product</th>
                            <th className="px-3 py-2 text-right font-medium">Views</th>
                            <th className="px-3 py-2 text-right font-medium">Add to cart</th>
                            <th className="px-3 py-2 text-right font-medium">Add-to-cart rate</th>
                            <th className="px-3 py-2 text-right font-medium">Purchases</th>
                            <th className="px-3 py-2 pr-4 text-right font-medium">View → purchase</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {products.map((p) => {
                            const warn = flagged(p);
                            return (
                                <tr key={p.slug} className={cx(warn && "bg-amber-50")}>
                                    <td className="px-4 py-2.5">
                                        <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className="font-medium text-zinc-900 hover:underline">
                                            {p.title || p.slug}
                                        </a>
                                        {warn && (
                                            <span className="ml-2">
                                                <Badge tone="amber">Many views, few adds</Badge>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-900">{p.views}</td>
                                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-900">{p.addToCart}</td>
                                    <td className={cx("px-3 py-2.5 text-right tabular-nums", warn ? "font-semibold text-amber-900" : "text-zinc-900")}>{pct(p.addToCart, p.views)}</td>
                                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-900">{p.purchases}</td>
                                    <td className="px-3 py-2.5 pr-4 text-right tabular-nums text-zinc-900">{pct(p.purchases, p.views)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <ul className="mt-3 divide-y divide-zinc-100 border-t border-zinc-200 md:hidden">
                {products.map((p) => {
                    const warn = flagged(p);
                    return (
                        <li key={p.slug} className={cx("px-4 py-3", warn && "bg-amber-50")}>
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-sm font-medium text-zinc-900">{p.title || p.slug}</span>
                                <span className="text-sm tabular-nums text-zinc-900">{p.views} views</span>
                            </div>
                            {warn && (
                                <div className="mt-1">
                                    <Badge tone="amber">Many views, few adds</Badge>
                                </div>
                            )}
                            <p className="mt-1 text-[13px] tabular-nums text-zinc-700">
                                {p.addToCart} added ({pct(p.addToCart, p.views)}) · {p.purchases} bought ({pct(p.purchases, p.views)} of views)
                            </p>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

function Share({ rows, unit }: { rows: { label: string; value: number; mono?: boolean }[]; unit: string }) {
    if (!rows.length) return <EmptyState title="No data yet" />;
    const total = rows.reduce((s, r) => s + r.value, 0);
    const max = Math.max(...rows.map((r) => r.value), 1);
    return (
        <ul className="mt-1 divide-y divide-zinc-100">
            {rows.map((r) => (
                <li key={r.label} className="px-4 py-2.5 sm:px-5">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={cx("min-w-0 truncate text-zinc-900", r.mono ? "font-mono text-[13px]" : "font-medium")}>{r.label}</span>
                        <span className="flex-shrink-0 tabular-nums text-zinc-800" title={`${r.value} ${unit}`}>
                            {r.value.toLocaleString("en-GB")}
                            <span className="ml-2 inline-block w-10 text-right text-xs text-zinc-600">{total ? Math.round((r.value / total) * 100) : 0}%</span>
                        </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100">
                        <div className="h-1.5 rounded-full bg-zinc-700" style={{ width: `${(r.value / max) * 100}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}
