"use client";

import { PERIODS, type PeriodKey, type Tally } from "@/lib/admin/metrics";
import { money } from "@/lib/admin/format";
import { ArrowDownIcon, ArrowUpIcon, Card, EmptyState, Tabs, cx } from "./ui";

const SHORT: Record<PeriodKey, string> = { today: "Today", "7d": "7 days", "30d": "30 days", "90d": "90 days", "12m": "12 months", all: "All time" };

export function PeriodTabs({ value, onChange }: { value: PeriodKey; onChange: (p: PeriodKey) => void }) {
    return <Tabs tabs={PERIODS.map((p) => ({ key: p.key, label: SHORT[p.key] }))} value={value} onChange={onChange} />;
}

export const periodLabel = (p: PeriodKey) => PERIODS.find((x) => x.key === p)?.label || "";

export function KpiCard({
    label,
    value,
    delta,
    hint,
    upIsGood = true,
}: {
    label: string;
    value: string;
    delta: number | null | undefined; // undefined = no comparison for this period
    hint?: string;
    upIsGood?: boolean;
}) {
    const good = delta !== null && delta !== undefined && (upIsGood ? delta > 0 : delta < 0);
    const bad = delta !== null && delta !== undefined && (upIsGood ? delta < 0 : delta > 0);
    return (
        <Card className="px-4 py-3.5">
            <p className="text-[13px] font-medium text-zinc-700">{label}</p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums leading-tight tracking-tight text-zinc-900">{value}</p>
            <div className="mt-1 flex min-h-[18px] flex-wrap items-center gap-x-1.5 text-xs">
                {delta === undefined ? (
                    hint && <span className="text-zinc-600">{hint}</span>
                ) : delta === null ? (
                    <span className="text-zinc-600">No earlier data to compare</span>
                ) : (
                    <>
                        <span className={cx("inline-flex items-center gap-0.5 font-medium tabular-nums", good ? "text-emerald-700" : bad ? "text-red-700" : "text-zinc-700")}>
                            {delta > 0 ? <ArrowUpIcon className="h-3.5 w-3.5" /> : delta < 0 ? <ArrowDownIcon className="h-3.5 w-3.5" /> : null}
                            {Math.abs(delta).toFixed(0)}%
                        </span>
                        <span className="text-zinc-600">vs previous period</span>
                    </>
                )}
            </div>
        </Card>
    );
}

// Ranked list with a proportional bar: label, share bar, value(s)
export function RankList({
    rows,
    metric = "quantity",
    showRevenue = false,
    unit = "",
    limit,
    labelFor,
}: {
    rows: Tally[];
    metric?: "quantity" | "orders" | "revenue";
    showRevenue?: boolean;
    unit?: string;
    limit?: number;
    labelFor?: (label: string) => React.ReactNode;
}) {
    if (!rows.length) return <EmptyState title="No data yet" />;
    const shown = limit ? rows.slice(0, limit) : rows;
    const total = rows.reduce((s, r) => s + r[metric], 0);
    const max = Math.max(...shown.map((r) => r[metric]), 1);
    return (
        <ul className="divide-y divide-zinc-100">
            {shown.map((r) => (
                <li key={r.label} className="px-4 py-2.5 sm:px-5">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-medium text-zinc-900">{labelFor ? labelFor(r.label) : r.label}</span>
                        <span className="flex-shrink-0 tabular-nums text-zinc-800">
                            {metric === "revenue" ? money(r.revenue) : `${r[metric]}${unit}`}
                            {showRevenue && metric !== "revenue" && <span className="ml-2 text-zinc-600">{money(r.revenue)}</span>}
                            <span className="ml-2 inline-block w-10 text-right text-xs text-zinc-600">{total ? Math.round((r[metric] / total) * 100) : 0}%</span>
                        </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100">
                        <div className="h-1.5 rounded-full bg-zinc-700" style={{ width: `${(r[metric] / max) * 100}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}
