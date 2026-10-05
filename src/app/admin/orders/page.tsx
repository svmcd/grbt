"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../_components/AdminProvider";
import { LoadErrorCard } from "../_components/LoadErrorCard";
import { OrderList } from "../_components/OrderList";
import { Card, DownloadIcon, PageHeader, PlusIcon, SearchIcon, Tabs, buttonClass, inputClass, selectClass, Button } from "../_components/ui";
import { countryName } from "@/lib/admin/format";
import { downloadCsv, isToShip, ordersCsvRows, searchOrder } from "@/lib/admin/metrics";
import type { AdminOrder } from "@/lib/admin/orders";

const TABS = ["all", "to_ship", "label_created", "shipped", "refunded", "archived"] as const;
type TabKey = (typeof TABS)[number];
const TAB_LABEL: Record<TabKey, string> = {
    all: "All",
    to_ship: "To ship",
    label_created: "Label created",
    shipped: "Shipped",
    refunded: "Refunded",
    archived: "Archived",
};
const TAB_FILTER: Record<TabKey, (o: AdminOrder) => boolean> = {
    all: (o) => !o.archived,
    to_ship: isToShip,
    label_created: (o) => !o.archived && o.fulfillment.status === "label_created",
    shipped: (o) => !o.archived && o.fulfillment.status === "shipped",
    refunded: (o) => !o.archived && (o.payment.status === "refunded" || o.payment.status === "partially_refunded"),
    archived: (o) => o.archived,
};

type SortKey = "newest" | "oldest" | "total_desc" | "total_asc";
const SORTS: Record<SortKey, { label: string; fn: (a: AdminOrder, b: AdminOrder) => number }> = {
    newest: { label: "Newest first", fn: (a, b) => b.created - a.created },
    oldest: { label: "Oldest first", fn: (a, b) => a.created - b.created },
    total_desc: { label: "Highest total", fn: (a, b) => b.amountTotal - a.amountTotal },
    total_asc: { label: "Lowest total", fn: (a, b) => a.amountTotal - b.amountTotal },
};

const PAGE_SIZE = 50;

export default function OrdersPage() {
    return (
        <Suspense>
            <Orders />
        </Suspense>
    );
}

function Orders() {
    const { orders } = useAdmin();
    const router = useRouter();
    const params = useSearchParams();
    const tabParam = params.get("tab") as TabKey | null;
    const tab: TabKey = tabParam && TABS.includes(tabParam) ? tabParam : "all";
    const urlQ = params.get("q") || "";

    const [q, setQ] = useState(urlQ);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [country, setCountry] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // The top-bar search lands here with ?q=
    useEffect(() => setQ((cur) => (cur.trim() === urlQ ? cur : urlQ)), [urlQ]);
    useEffect(() => setPage(1), [tab, q, from, to, country, sort]);
    // Keep the search in the URL, so going back from an order keeps the list as it was
    useEffect(() => {
        if (q.trim() === urlQ) return;
        const t = setTimeout(() => setParam("q", q.trim()), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const setParam = (key: string, value: string) => {
        const next = new URLSearchParams(params.toString());
        if (value) next.set(key, value);
        else next.delete(key);
        router.replace(`/admin/orders${next.toString() ? `?${next}` : ""}`, { scroll: false });
    };

    const countries = useMemo(() => [...new Set(orders.map((o) => o.shipping.country).filter(Boolean))].sort(), [orders]);

    // Everything except the tab, so tab counts follow the other filters
    const base = useMemo(() => {
        const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
        const toMs = to ? new Date(`${to}T00:00:00`).getTime() + 86400000 : Infinity;
        return orders.filter(
            (o) => searchOrder(o, q) && o.created * 1000 >= fromMs && o.created * 1000 < toMs && (!country || o.shipping.country === country),
        );
    }, [orders, q, from, to, country]);

    const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t, base.filter(TAB_FILTER[t]).length])) as Record<TabKey, number>, [base]);
    const filtered = useMemo(() => base.filter(TAB_FILTER[tab]).sort(SORTS[sort].fn), [base, tab, sort]);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const filtersActive = Boolean(q || from || to || country);

    const toggle = (id: string) =>
        setSelected((s) => {
            const n = new Set(s);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    const allShownSelected = shown.length > 0 && shown.every((o) => selected.has(o.id));
    const toggleAll = () =>
        setSelected((s) => {
            const n = new Set(s);
            shown.forEach((o) => (allShownSelected ? n.delete(o.id) : n.add(o.id)));
            return n;
        });

    const exportCsv = () => {
        const rows = selected.size ? orders.filter((o) => selected.has(o.id)) : filtered;
        downloadCsv(`egrikuyu-orders-${new Date().toISOString().slice(0, 10)}.csv`, ordersCsvRows(rows));
    };

    return (
        <>
            <PageHeader
                title="Orders"
                actions={
                    <>
                        <Button onClick={exportCsv} disabled={!filtered.length && !selected.size}>
                            <DownloadIcon className="h-4 w-4" />
                            {selected.size ? `Export ${selected.size} selected` : "Export CSV"}
                        </Button>
                        <Link href="/admin/orders/new" className={buttonClass("primary")}>
                            <PlusIcon className="h-4 w-4" />
                            Create order
                        </Link>
                    </>
                }
            />
            <LoadErrorCard />

            <div className="mb-3">
                <Tabs tabs={TABS.map((t) => ({ key: t, label: TAB_LABEL[t], count: counts[t] }))} value={tab} onChange={(t) => setParam("tab", t === "all" ? "" : t)} />
            </div>

            <Card>
                <div className="grid gap-2 border-b border-zinc-200 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search number, name, email, city, design"
                            className={`${inputClass} pl-8`}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-[13px] text-zinc-700">
                        <span className="w-9 lg:w-auto">From</span>
                        <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} lg:w-[150px]`} />
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-zinc-700">
                        <span className="w-9 lg:w-auto">To</span>
                        <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={`${inputClass} lg:w-[150px]`} />
                    </label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className={`${selectClass} lg:w-[180px]`} aria-label="Country">
                        <option value="">All countries</option>
                        {countries.map((c) => (
                            <option key={c} value={c}>
                                {countryName(c)}
                            </option>
                        ))}
                    </select>
                    <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${selectClass} lg:w-[170px]`} aria-label="Sort">
                        {Object.entries(SORTS).map(([k, s]) => (
                            <option key={k} value={k}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
                {(filtersActive || selected.size > 0) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-zinc-200 px-4 py-2 text-[13px] text-zinc-700">
                        <span>
                            {filtered.length} order{filtered.length === 1 ? "" : "s"} match
                        </span>
                        {filtersActive && (
                            <button
                                className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                                onClick={() => {
                                    setQ("");
                                    setFrom("");
                                    setTo("");
                                    setCountry("");
                                    setParam("q", "");
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                        {selected.size > 0 && (
                            <button className="font-medium text-zinc-900 underline-offset-2 hover:underline" onClick={() => setSelected(new Set())}>
                                Clear selection ({selected.size})
                            </button>
                        )}
                    </div>
                )}

                <OrderList
                    orders={shown}
                    selectable={{ selected, toggle, toggleAll, allSelected: allShownSelected }}
                    empty={tab === "to_ship" && !filtersActive ? "Nothing to ship. Every paid order has a label or is shipped." : "No orders match"}
                />

                {pages > 1 && (
                    <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-[13px] text-zinc-700">
                        <span>
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-2">
                            <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                Previous
                            </Button>
                            <Button size="sm" disabled={page === pages} onClick={() => setPage(page + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </>
    );
}
