"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "../../../_components/AdminProvider";
import { addressLines } from "../../../_components/order/SideCards";
import { formatDate } from "@/lib/admin/format";

// Print-friendly packing slip: no prices, everything production and packing need
export default function PackingSlip() {
    const { id } = useParams<{ id: string }>();
    const { orders } = useAdmin();
    const order = orders.find((o) => o.id === decodeURIComponent(id));

    useEffect(() => {
        if (!order) return;
        const t = setTimeout(() => window.print(), 400);
        return () => clearTimeout(t);
    }, [order]);

    if (!order) return <p className="p-8 text-sm text-zinc-800">Order not found.</p>;

    return (
        <div className="min-h-screen bg-paper text-zinc-950 print:min-h-0">
            <style>{`@page { size: A4; margin: 14mm; } @media print { body { background: #fff; } }`}</style>
            <div className="mx-auto max-w-[720px] px-6 py-8 print:max-w-none print:p-0">
                <div className="mb-6 flex items-start justify-between gap-4 print:hidden">
                    <p className="text-sm text-zinc-700">The print dialog opens automatically.</p>
                    <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-paper">
                        Print
                    </button>
                </div>

                <header className="flex items-start justify-between gap-6 border-b border-zinc-300 pb-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/egrikuyu.svg" alt="eğrikuyu" className="h-10 w-auto" />
                    <div className="text-right text-sm">
                        <p className="text-lg font-semibold">Order #{order.number}</p>
                        <p className="text-zinc-700">{formatDate(order.created)}</p>
                    </div>
                </header>

                <section className="border-b border-zinc-300 py-5 text-sm">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-700">Ship to</p>
                        {addressLines(order).map((l, i) => (
                            <p key={i} className={i === 0 ? "font-semibold" : ""}>
                                {l}
                            </p>
                        ))}
                    </div>
                </section>

                <section className="py-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-700">
                        Items ({order.itemCount})
                    </p>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-300 text-xs text-zinc-700">
                                <th className="w-12 py-2 font-medium">Qty</th>
                                <th className="py-2 font-medium">Item</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                                <tr key={i} className="border-b border-zinc-200 align-top" style={{ breakInside: "avoid" }}>
                                    <td className="py-3 text-base font-semibold">{item.quantity}×</td>
                                    <td className="py-3">
                                        <p className="text-base font-semibold">
                                            {item.title} {item.productType}
                                        </p>
                                        <p className="text-zinc-800">
                                            {[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(" · ") || (item.raw !== item.title ? item.raw : "")}
                                        </p>
                                        {item.personalization && (
                                            <div className="mt-2 border-l-4 border-zinc-900 pl-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide">Personalization · {item.personalization.method}</p>
                                                <p className="text-base font-semibold">“{item.personalization.text}”</p>
                                                <p className="text-zinc-800">
                                                    {[
                                                        item.personalization.placement && `Placement: ${item.personalization.placement}`,
                                                        item.personalization.font && `Font: ${item.personalization.font}`,
                                                        item.personalization.color && `Color: ${item.personalization.color}`,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            </div>
                                        )}
                                        {item.gift && (
                                            <div className="mt-2 border-l-4 border-zinc-500 pl-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide">Gift package</p>
                                                {item.gift.message && <p className="whitespace-pre-wrap">“{item.gift.message}”</p>}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

            </div>
        </div>
    );
}
