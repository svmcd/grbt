"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, DownloadIcon, EmptyState, LoadingBlock, PageHeader, SearchIcon, inputClass } from "../_components/ui";
import { adminFetch } from "@/lib/admin/client";
import { formatDate } from "@/lib/admin/format";
import { csvDateTime, csvToday, downloadCsv } from "@/lib/admin/metrics";

type Subscriber = { email: string; createdAt: string | null; source: string };

export default function SubscribersPage() {
    const [subs, setSubs] = useState<Subscriber[] | null>(null);
    const [error, setError] = useState("");
    const [q, setQ] = useState("");
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        setError("");
        adminFetch<{ subscribers: Subscriber[] }>("/api/admin/subscribers")
            .then((r) => setSubs(r.subscribers))
            .catch((e) => setError(e instanceof Error ? e.message : "Could not load subscribers"));
    }, [attempt]);

    const shown = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return (subs || []).filter((s) => !needle || `${s.email} ${s.source}`.toLowerCase().includes(needle));
    }, [subs, q]);

    const last30 = (subs || []).filter((s) => s.createdAt && Date.now() - new Date(s.createdAt).getTime() < 30 * 86400000).length;

    const exportCsv = () =>
        downloadCsv(`egrikuyu-subscribers-${csvToday()}.csv`, [
            ["Email", "Signed up (Amsterdam time)", "Source"],
            ...shown.map((s) => [s.email, csvDateTime(s.createdAt), s.source]),
        ]);

    return (
        <>
            <PageHeader
                title="Subscribers"
                meta={subs && <span className="text-sm text-zinc-700">{subs.length} newsletter subscribers · {last30} in the last 30 days</span>}
                actions={
                    <Button onClick={exportCsv} disabled={!shown.length}>
                        <DownloadIcon className="h-4 w-4" />
                        Export CSV
                    </Button>
                }
            />
            <Card>
                <div className="border-b border-zinc-200 p-3">
                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or source" className={`${inputClass} pl-8`} />
                    </div>
                </div>
                {error ? (
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm text-red-800">{error}</p>
                        <Button className="mt-3" size="sm" onClick={() => setAttempt((n) => n + 1)}>
                            Try again
                        </Button>
                    </div>
                ) : !subs ? (
                    <LoadingBlock />
                ) : !shown.length ? (
                    <EmptyState title={subs.length ? "No subscribers match" : "No subscribers yet"} />
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-700">
                                <th className="px-4 py-2 font-medium">Email</th>
                                <th className="w-px whitespace-nowrap px-3 py-2 font-medium">Signed up</th>
                                <th className="hidden px-3 py-2 pr-4 font-medium sm:table-cell">Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {shown.map((s) => (
                                <tr key={s.email}>
                                    <td className="w-full max-w-0 px-4 py-2.5">
                                        <a href={`mailto:${s.email}`} className="block truncate text-zinc-900 hover:underline">
                                            {s.email}
                                        </a>
                                        {s.source && <span className="block truncate text-xs text-zinc-600 sm:hidden">{s.source}</span>}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2.5 text-zinc-800">{s.createdAt ? formatDate(s.createdAt) : "–"}</td>
                                    <td className="hidden px-3 py-2.5 pr-4 text-zinc-800 sm:table-cell">{s.source || "–"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </>
    );
}
