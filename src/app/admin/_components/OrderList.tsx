"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminOrder } from "@/lib/admin/orders";
import { countryName, formatOrderDate, money } from "@/lib/admin/format";
import { itemsSummary } from "@/lib/admin/metrics";
import { Badge, EmptyState, FlagIcon, FulfillmentBadge, NoteIcon, PaymentBadge } from "./ui";

type Selectable = { selected: Set<string>; toggle: (id: string) => void; toggleAll: () => void; allSelected: boolean };

const checkbox = "h-4 w-4 cursor-pointer rounded border-zinc-400 accent-zinc-900";

function Indicators({ o }: { o: AdminOrder }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            {o.flag && (
                <span className="inline-flex max-w-[140px] items-center gap-1 truncate rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-800" title={`Tag: ${o.flag}`}>
                    <FlagIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{o.flag}</span>
                </span>
            )}
            {o.notes && (
                <span className="text-zinc-600" title={o.notes}>
                    <NoteIcon className="h-4 w-4" />
                    <span className="sr-only">Has notes</span>
                </span>
            )}
            {o.items.some((i) => i.personalization) && <Badge tone="purple">Personalized</Badge>}
            {o.items.some((i) => i.gift) && <Badge tone="blue">Gift</Badge>}
            {o.manual && <Badge>Manual</Badge>}
        </span>
    );
}

// Orders as a table on desktop and as stacked cards on phones
// compact: leaves out the customer and country columns (customer page)
export function OrderList({ orders, selectable, empty = "No orders", compact = false }: { orders: AdminOrder[]; selectable?: Selectable; empty?: string; compact?: boolean }) {
    const router = useRouter();
    if (!orders.length) return <EmptyState title={empty} />;
    const open = (o: AdminOrder) => router.push(`/admin/orders/${o.id}`);

    return (
        <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700">
                            {selectable && (
                                <th className="w-10 py-2 pl-4">
                                    <input type="checkbox" className={checkbox} checked={selectable.allSelected} onChange={selectable.toggleAll} aria-label="Select all on this page" />
                                </th>
                            )}
                            <th className="px-3 py-2 font-medium">Order</th>
                            <th className="px-3 py-2 font-medium">Date</th>
                            {!compact && <th className="px-3 py-2 font-medium">Customer</th>}
                            {!compact && <th className="px-3 py-2 font-medium">Country</th>}
                            <th className="px-3 py-2 font-medium">Items</th>
                            <th className="px-3 py-2 text-right font-medium">Total</th>
                            <th className="px-3 py-2 font-medium">Payment</th>
                            <th className="px-3 py-2 pr-4 font-medium">Fulfillment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {orders.map((o) => (
                            <tr key={o.id} onClick={() => open(o)} className={`cursor-pointer hover:bg-zinc-50 ${selectable?.selected.has(o.id) ? "bg-zinc-50" : ""}`}>
                                {selectable && (
                                    <td className="py-2.5 pl-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className={checkbox}
                                            checked={selectable.selected.has(o.id)}
                                            onChange={() => selectable.toggle(o.id)}
                                            aria-label={`Select order ${o.number}`}
                                        />
                                    </td>
                                )}
                                <td className="whitespace-nowrap px-3 py-2.5">
                                    <Link href={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-zinc-900 hover:underline">
                                        #{o.number}
                                    </Link>
                                    <div className="mt-0.5">
                                        <Indicators o={o} />
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-zinc-800">{formatOrderDate(o.created)}</td>
                                {!compact && (
                                    <>
                                <td className="max-w-[180px] px-3 py-2.5">
                                    <p className="truncate text-zinc-900">{o.customer.name || o.shipping.name || "No name"}</p>
                                    <p className="truncate text-xs text-zinc-600">{o.customer.email}</p>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-zinc-800">{o.shipping.country ? countryName(o.shipping.country) : "–"}</td>
                                    </>
                                )}
                                <td className="max-w-[260px] px-3 py-2.5">
                                    <p className="line-clamp-2 text-zinc-800">{itemsSummary(o)}</p>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-zinc-900">
                                    {money(o.amountTotal)}
                                    {o.payment.refundedAmount > 0 && <p className="text-xs text-zinc-600">net {money(o.netAmount)}</p>}
                                </td>
                                <td className="px-3 py-2.5">
                                    <PaymentBadge status={o.payment.status} />
                                </td>
                                <td className="px-3 py-2.5 pr-4">
                                    <div className="flex flex-col items-start gap-1">
                                        <FulfillmentBadge status={o.fulfillment.status} />
                                        {o.archived && <Badge>Archived</Badge>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phone */}
            <ul className="divide-y divide-zinc-100 md:hidden">
                {orders.map((o) => (
                    <li key={o.id} className={`flex gap-3 px-3 py-3 ${selectable?.selected.has(o.id) ? "bg-zinc-50" : ""}`}>
                        {selectable && (
                            <input
                                type="checkbox"
                                className={`${checkbox} mt-1 flex-shrink-0`}
                                checked={selectable.selected.has(o.id)}
                                onChange={() => selectable.toggle(o.id)}
                                aria-label={`Select order ${o.number}`}
                            />
                        )}
                        <Link href={`/admin/orders/${o.id}`} className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-sm font-semibold text-zinc-900">#{o.number}</span>
                                <span className="text-sm font-medium tabular-nums text-zinc-900">{money(o.amountTotal)}</span>
                            </div>
                            <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[13px]">
                                <span className="truncate text-zinc-800">
                                    {o.customer.name || o.shipping.name || o.customer.email}
                                    {o.shipping.country && <span className="text-zinc-600"> · {o.shipping.country}</span>}
                                </span>
                                <span className="flex-shrink-0 text-xs text-zinc-600">{formatOrderDate(o.created)}</span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[13px] text-zinc-700">{itemsSummary(o)}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <PaymentBadge status={o.payment.status} />
                                <FulfillmentBadge status={o.fulfillment.status} />
                                {o.archived && <Badge>Archived</Badge>}
                                <Indicators o={o} />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
