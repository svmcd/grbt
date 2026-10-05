"use client";

import type { AdminOrder } from "@/lib/admin/orders";
import { formatDate, money } from "@/lib/admin/format";
import { Card, ExternalIcon, PaymentBadge, buttonClass } from "../ui";

function Row({ label, value, strong, muted }: { label: React.ReactNode; value: string; strong?: boolean; muted?: boolean }) {
    return (
        <div className={`flex items-baseline justify-between gap-4 py-1 text-sm ${strong ? "font-semibold text-zinc-900" : muted ? "text-zinc-700" : "text-zinc-800"}`}>
            <span>{label}</span>
            <span className="tabular-nums">{value}</span>
        </div>
    );
}

export function PaymentCard({ order }: { order: AdminOrder }) {
    const { amountTotal, amountShipping, amountDiscount, payment } = order;
    const subtotal = amountShipping !== null ? amountTotal - amountShipping + (amountDiscount || 0) : null;
    const refunds = [...payment.refunds].sort((a, b) => a.created - b.created);

    return (
        <Card
            title={
                <span className="flex items-center gap-2">
                    Payment <PaymentBadge status={payment.status} />
                </span>
            }
            action={
                order.stripeUrl && (
                    <a href={order.stripeUrl} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}>
                        Refund in Stripe
                        <ExternalIcon className="h-3.5 w-3.5" />
                    </a>
                )
            }
        >
            <div className="px-4 pb-4 pt-3 sm:px-5">
                {subtotal !== null && (
                    <>
                        <Row label={`Subtotal · ${order.itemCount} item${order.itemCount === 1 ? "" : "s"}`} value={money(subtotal)} />
                        {(amountDiscount || 0) > 0 && <Row label="Discount" value={`−${money(amountDiscount || 0)}`} />}
                        <Row label="Shipping" value={money(amountShipping || 0)} />
                    </>
                )}
                <div className={subtotal !== null ? "mt-1 border-t border-zinc-100 pt-1" : ""}>
                    <Row label={order.manual ? "Total (entered manually)" : "Paid by customer"} value={money(amountTotal)} strong />
                </div>
                {refunds.map((r) => (
                    <Row
                        key={r.id}
                        muted
                        label={
                            <>
                                Refunded {r.created ? formatDate(r.created) : ""}
                                {r.reason && <span className="text-zinc-600"> · {r.reason.replace(/_/g, " ")}</span>}
                                {r.status !== "succeeded" && <span className="text-amber-800"> · {r.status}</span>}
                            </>
                        }
                        value={`−${money(r.amount)}`}
                    />
                ))}
                {!refunds.length && payment.refundedAmount > 0 && <Row muted label="Refunded" value={`−${money(payment.refundedAmount)}`} />}
                {payment.refundedAmount > 0 && (
                    <div className="mt-1 border-t border-zinc-100 pt-1">
                        <Row label="Net" value={money(order.netAmount)} strong />
                    </div>
                )}
                {order.stripeUrl ? (
                    <p className="mt-3 text-xs text-zinc-600">Refunds are made in Stripe. “Sync with Stripe” brings them in here.</p>
                ) : (
                    order.manual && <p className="mt-3 text-xs text-zinc-600">Manual order: not paid through Stripe.</p>
                )}
            </div>
        </Card>
    );
}
