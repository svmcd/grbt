"use client";

import Image from "next/image";
import { cloprodLabel, type AdminOrder, type AdminOrderItem } from "@/lib/admin/orders";
import { designImage } from "@/lib/admin/design-image";
import { money } from "@/lib/admin/format";
import { Card, FulfillmentBadge, GiftIcon, PenIcon } from "../ui";

export function ItemsCard({ order }: { order: AdminOrder }) {
    return (
        <Card title={<span className="flex items-center gap-2">Items <FulfillmentBadge status={order.fulfillment.status} /></span>}>
            <ul className="mt-2 divide-y divide-zinc-100">
                {order.items.map((item, i) => (
                    <ItemRow key={i} item={item} />
                ))}
                {!order.items.length && <li className="px-5 py-6 text-sm text-zinc-600">No items stored on this order.</li>}
            </ul>
        </Card>
    );
}

function ItemRow({ item }: { item: AdminOrderItem }) {
    const img = designImage(item.title, item.productType, item.color);
    const variant = [item.productType, item.color, item.size].filter(Boolean).join(" · ");
    const parsed = Boolean(item.productType || item.color || item.size);
    const cloprod = cloprodLabel(item);
    return (
        <li className="px-4 py-3.5 sm:px-5">
            <div className="flex gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                    {img && <Image src={img} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                            {variant && <p className="mt-0.5 text-[13px] text-zinc-700">{variant}</p>}
                            {cloprod && <p className="mt-0.5 text-xs text-zinc-600">Cloprod: {cloprod}</p>}
                            {!parsed && item.raw && item.raw !== item.title && <p className="mt-0.5 text-[13px] text-zinc-700">{item.raw}</p>}
                        </div>
                        <div className="flex flex-shrink-0 gap-4 text-sm tabular-nums sm:text-right">
                            <span className="text-zinc-700">
                                {item.unitAmount > 0 ? `${money(item.unitAmount)} × ${item.quantity}` : `Qty ${item.quantity}`}
                            </span>
                            <span className="w-20 font-medium text-zinc-900 sm:text-right">{item.totalAmount > 0 ? money(item.totalAmount) : "–"}</span>
                        </div>
                    </div>

                    {item.personalization && (
                        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-900">
                                <PenIcon className="h-3.5 w-3.5" />
                                Personalization · {item.personalization.method}
                            </p>
                            <p className="mt-1.5 break-words text-lg font-semibold leading-snug text-zinc-950">“{item.personalization.text}”</p>
                            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
                                {item.personalization.placement && (
                                    <>
                                        <dt className="text-violet-900">Placement</dt>
                                        <dd className="text-zinc-900">{item.personalization.placement}</dd>
                                    </>
                                )}
                                {item.personalization.font && (
                                    <>
                                        <dt className="text-violet-900">Font</dt>
                                        <dd className="text-zinc-900">{item.personalization.font}</dd>
                                    </>
                                )}
                                {item.personalization.color && (
                                    <>
                                        <dt className="text-violet-900">Color</dt>
                                        <dd className="flex items-center gap-2 text-zinc-900">
                                            <span className="h-4 w-4 rounded border border-zinc-400" style={{ background: item.personalization.color }} />
                                            <span className="font-mono text-xs">{item.personalization.color}</span>
                                        </dd>
                                    </>
                                )}
                            </dl>
                        </div>
                    )}

                    {item.gift && (
                        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-900">
                                <GiftIcon className="h-3.5 w-3.5" />
                                Gift package
                            </p>
                            {item.gift.message ? (
                                <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] text-zinc-950">“{item.gift.message}”</p>
                            ) : (
                                <p className="mt-1 text-[13px] text-zinc-800">No message</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
}
