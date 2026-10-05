"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "../../../_components/AdminProvider";
import { LoadErrorCard } from "../../../_components/LoadErrorCard";
import { PackingSlip, SLIP_PAGE_STYLE } from "../../../_components/order/PackingSlip";

// Print-friendly packing slip: no prices, everything production and packing need
export default function PackingSlipPage() {
    const { id } = useParams<{ id: string }>();
    const { orders, loadError } = useAdmin();
    const order = orders.find((o) => o.id === decodeURIComponent(id));

    useEffect(() => {
        if (!order) return;
        const t = setTimeout(() => window.print(), 400);
        return () => clearTimeout(t);
    }, [order]);

    if (!order) {
        return (
            <div className="p-8">
                {loadError ? <LoadErrorCard /> : <p className="text-sm text-zinc-800">Order not found.</p>}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper text-zinc-950 print:min-h-0">
            <style>{SLIP_PAGE_STYLE}</style>
            <div className="mx-auto max-w-[720px] px-6 py-8 print:max-w-none print:p-0">
                <div className="mb-6 flex items-start justify-between gap-4 print:hidden">
                    <p className="text-sm text-zinc-700">The print dialog opens automatically.</p>
                    <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-paper">
                        Print
                    </button>
                </div>
                <PackingSlip order={order} />
            </div>
        </div>
    );
}
