"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "../_components/AdminProvider";
import { Badge, Card, DownloadIcon, EmptyState, PageHeader, SearchIcon, Button, inputClass, selectClass } from "../_components/ui";
import { countryName, formatDate, money } from "@/lib/admin/format";
import { downloadCsv, groupCustomers, type Customer } from "@/lib/admin/metrics";

type SortKey = "last" | "spent" | "orders" | "first" | "name";
const SORTS: Record<SortKey, { label: string; fn: (a: Customer, b: Customer) => number }> = {
    last: { label: "Last order", fn: (a, b) => b.lastOrder - a.lastOrder },
    spent: { label: "Total spent", fn: (a, b) => b.totalSpent - a.totalSpent },
    orders: { label: "Number of orders", fn: (a, b) => b.orderCount - a.orderCount || b.totalSpent - a.totalSpent },
    first: { label: "First order", fn: (a, b) => a.firstOrder - b.firstOrder },
    name: { label: "Name", fn: (a, b) => a.name.localeCompare(b.name, "tr") },
};

export default function CustomersPage() {
    const { orders } = useAdmin();
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("last");
    const [returningOnly, setReturningOnly] = useState(false);

    const customers = useMemo(() => groupCustomers(orders), [orders]);
    const shown = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return customers
            .filter((c) => !returningOnly || c.orderCount > 1)
            .filter((c) => !needle || `${c.name} ${c.email} ${c.phone} ${c.orders[0]?.shipping.city || ""}`.toLowerCase().includes(needle))
            .sort(SORTS[sort].fn);
    }, [customers, q, sort, returningOnly]);
    const returning = customers.filter((c) => c.orderCount > 1).length;

    const exportCsv = () =>
        downloadCsv(`egrikuyu-customers-${new Date().toISOString().slice(0, 10)}.csv`, [
            ["Name", "Email", "Phone", "Country", "Orders", "Total spent (EUR)", "First order", "Last order"],
            ...shown.map((c) => [
                c.name,
                c.email,
                c.phone,
                c.country,
                c.orderCount,
                (c.totalSpent / 100).toFixed(2),
                new Date(c.firstOrder * 1000).toISOString().slice(0, 10),
                new Date(c.lastOrder * 1000).toISOString().slice(0, 10),
            ]),
        ]);

    return (
        <>
            <PageHeader
                title="Customers"
                meta={<span className="text-sm text-zinc-700">{customers.length} customers · {returning} returning</span>}
                actions={
                    <Button onClick={exportCsv} disabled={!shown.length}>
                        <DownloadIcon className="h-4 w-4" />
                        Export CSV
                    </Button>
                }
            />
            <Card>
                <div className="flex flex-col gap-2 border-b border-zinc-200 p-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, city" className={`${inputClass} pl-8`} />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 whitespace-nowrap text-[13px] text-zinc-800">
                            <input type="checkbox" className="h-4 w-4 accent-zinc-900" checked={returningOnly} onChange={(e) => setReturningOnly(e.target.checked)} />
                            Returning only
                        </label>
                        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${selectClass} sm:w-[180px]`} aria-label="Sort">
                            {Object.entries(SORTS).map(([k, s]) => (
                                <option key={k} value={k}>
                                    Sort: {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {!shown.length ? (
                    <EmptyState title={customers.length ? "No customers match" : "No customers yet"} />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-700">
                                        <th className="px-4 py-2 font-medium">Customer</th>
                                        <th className="px-3 py-2 font-medium">Country</th>
                                        <th className="px-3 py-2 text-right font-medium">Orders</th>
                                        <th className="px-3 py-2 text-right font-medium">Total spent</th>
                                        <th className="px-3 py-2 font-medium">First order</th>
                                        <th className="px-3 py-2 pr-4 font-medium">Last order</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {shown.map((c) => (
                                        <tr key={c.key} className="hover:bg-zinc-50">
                                            <td className="px-4 py-2.5">
                                                <Link href={`/admin/customers/${c.key}`} className="block">
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-medium text-zinc-900 hover:underline">{c.name || "No name"}</span>
                                                        {c.orderCount > 1 && <Badge tone="green">Returning</Badge>}
                                                    </span>
                                                    <span className="block text-xs text-zinc-600">{c.email || "No email"}</span>
                                                </Link>
                                            </td>
                                            <td className="px-3 py-2.5 text-zinc-800">{c.country ? countryName(c.country) : "–"}</td>
                                            <td className="px-3 py-2.5 text-right tabular-nums text-zinc-900">{c.orderCount}</td>
                                            <td className="px-3 py-2.5 text-right tabular-nums text-zinc-900">{money(c.totalSpent)}</td>
                                            <td className="px-3 py-2.5 text-zinc-800">{formatDate(c.firstOrder)}</td>
                                            <td className="px-3 py-2.5 pr-4 text-zinc-800">{formatDate(c.lastOrder)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <ul className="divide-y divide-zinc-100 md:hidden">
                            {shown.map((c) => (
                                <li key={c.key}>
                                    <Link href={`/admin/customers/${c.key}`} className="block px-3 py-3">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="truncate text-sm font-medium text-zinc-900">{c.name || "No name"}</span>
                                                {c.orderCount > 1 && <Badge tone="green">Returning</Badge>}
                                            </span>
                                            <span className="text-sm font-medium tabular-nums text-zinc-900">{money(c.totalSpent)}</span>
                                        </div>
                                        <p className="mt-0.5 truncate text-[13px] text-zinc-700">{c.email}</p>
                                        <p className="mt-0.5 text-xs text-zinc-600">
                                            {c.orderCount} order{c.orderCount === 1 ? "" : "s"} · {c.country ? countryName(c.country) : "–"} · last {formatDate(c.lastOrder)}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </Card>
        </>
    );
}
