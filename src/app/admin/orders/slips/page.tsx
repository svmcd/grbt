"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useAdmin } from "../../_components/AdminProvider";
import { LoadErrorCard } from "../../_components/LoadErrorCard";
import { PackingSlip, SLIP_PAGE_STYLE } from "../../_components/order/PackingSlip";

// Packing slips for several orders (?ids=a,b,c) in one print, one order per page
export default function PackingSlipsPage() {
    return (
        <Suspense>
            <Slips />
        </Suspense>
    );
}

function Slips() {
    const params = useSearchParams();
    const { orders, loadError } = useAdmin();
    const ids = useMemo(() => (params.get("ids") || "").split(",").filter(Boolean), [params]);
    const list = useMemo(() => ids.map((id) => orders.find((o) => o.id === id)).filter((o) => o !== undefined), [ids, orders]);
    const missing = ids.length - list.length;

    useEffect(() => {
        if (!list.length) return;
        const t = setTimeout(() => window.print(), 500);
        return () => clearTimeout(t);
    }, [list.length]);

    if (!list.length) {
        return (
            <div className="p-8">
                {loadError ? <LoadErrorCard /> : <p className="text-sm text-zinc-800">No orders selected.</p>}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper text-zinc-950 print:min-h-0">
            <style>{SLIP_PAGE_STYLE}</style>
            <div className="mx-auto max-w-[720px] px-6 py-8 print:max-w-none print:p-0">
                <div className="mb-6 flex items-start justify-between gap-4 print:hidden">
                    <p className="text-sm text-zinc-700">
                        {list.length} packing slip{list.length === 1 ? "" : "s"}, one per page. The print dialog opens automatically.
                        {missing > 0 && ` ${missing} order${missing === 1 ? " was" : "s were"} not found.`}
                    </p>
                    <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-paper">
                        Print
                    </button>
                </div>
                {list.map((o, i) => (
                    <PackingSlip key={o.id} order={o} breakBefore={i > 0} />
                ))}
            </div>
        </div>
    );
}
