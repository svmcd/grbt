"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAdmin } from "../../_components/AdminProvider";
import { LoadErrorCard } from "../../_components/LoadErrorCard";
import { OrderList } from "../../_components/OrderList";
import { addressLines } from "../../_components/order/SideCards";
import { Badge, Card, EmptyState, PageHeader } from "../../_components/ui";
import { formatDate, languageName, money } from "@/lib/admin/format";
import { groupCustomers } from "@/lib/admin/metrics";

export default function CustomerPage() {
    const { key } = useParams<{ key: string }>();
    const { orders, loadError } = useAdmin();
    const customer = useMemo(() => groupCustomers(orders).find((c) => c.key === key), [orders, key]);

    if (!customer && loadError) {
        return (
            <>
                <PageHeader title="Customer" back={{ href: "/admin/customers", label: "Customers" }} />
                <LoadErrorCard />
            </>
        );
    }

    if (!customer) {
        return (
            <>
                <PageHeader title="Customer not found" back={{ href: "/admin/customers", label: "Customers" }} />
                <Card>
                    <EmptyState title="No orders for this customer." />
                </Card>
            </>
        );
    }

    const refunded = customer.orders.reduce((s, o) => s + o.payment.refundedAmount, 0);
    const items = customer.orders.filter((o) => o.payment.status !== "refunded").reduce((s, o) => s + o.itemCount, 0);
    const latest = customer.orders[0];

    return (
        <>
            <PageHeader
                title={customer.name || "No name"}
                back={{ href: "/admin/customers", label: "Customers" }}
                meta={customer.orderCount > 1 ? <Badge tone="green">Returning customer</Badge> : undefined}
            />
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Total spent" value={money(customer.totalSpent)} hint="After refunds" />
                <Stat label="Orders" value={String(customer.orderCount)} />
                <Stat label="Average order" value={money(customer.orderCount ? Math.round((customer.totalSpent + refunded) / customer.orderCount) : 0)} />
                <Stat label="Items bought" value={String(items)} hint={refunded ? `${money(refunded)} refunded` : undefined} />
            </div>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card title={`Orders (${customer.orders.length})`}>
                    <div className="mt-3 border-t border-zinc-200">
                        <OrderList orders={customer.orders} compact />
                    </div>
                </Card>
                <div className="space-y-4">
                    <Card title="Contact">
                        <div className="space-y-1 px-4 pb-4 pt-3 text-sm sm:px-5">
                            {customer.email ? (
                                <a href={`mailto:${customer.email}`} className="block break-all text-zinc-900 hover:underline">
                                    {customer.email}
                                </a>
                            ) : (
                                <p className="text-zinc-600">No email</p>
                            )}
                            {customer.phone && (
                                <a href={`tel:${customer.phone}`} className="block text-zinc-900 hover:underline">
                                    {customer.phone}
                                </a>
                            )}
                            <p className="text-zinc-700">Language: {languageName(customer.locale)}</p>
                            <p className="text-zinc-700">
                                Customer since {formatDate(customer.firstOrder)}
                            </p>
                        </div>
                    </Card>
                    {latest && (
                        <Card title="Last shipping address">
                            <div className="px-4 pb-4 pt-3 text-sm leading-6 text-zinc-900 sm:px-5">
                                {addressLines(latest).map((l, i) => (
                                    <p key={i}>{l}</p>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <Card className="px-4 py-3.5">
            <p className="text-[13px] font-medium text-zinc-700">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-zinc-600">{hint}</p>}
        </Card>
    );
}
