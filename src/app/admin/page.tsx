"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "./_components/AdminProvider";
import { BarChart } from "./_components/BarChart";
import { KpiCard, PeriodTabs, RankList, periodLabel } from "./_components/reports";
import { LoadErrorCard } from "./_components/LoadErrorCard";
import { sumDays, useTraffic } from "./_components/useTraffic";
import { Card, ChevronRight, FulfillmentBadge, PageHeader, PaymentBadge, buttonClass, cx } from "./_components/ui";
import { daysSince, formatOrderDate, money, plural } from "@/lib/admin/format";
import { change, inRange, isAwaitingShipment, isToShip, kpis, periodRange, salesBuckets, tallyItems, type PeriodKey } from "@/lib/admin/metrics";

export default function AdminHome() {
    const { orders, loadError, reviews } = useAdmin();
    const pendingReviews = reviews.reviews.filter((r) => r.status === "pending");
    const [period, setPeriod] = useState<PeriodKey>("30d");

    const data = useMemo(() => {
        const { current, previous } = periodRange(period, orders);
        const inPeriod = orders.filter((o) => inRange(o, current));
        const now = kpis(inPeriod);
        const before = previous ? kpis(orders.filter((o) => inRange(o, previous))) : null;
        return {
            now,
            before,
            buckets: salesBuckets(orders, current, period),
            designs: tallyItems(inPeriod, (i) => i.title),
        };
    }, [orders, period]);

    const toShip = orders.filter(isToShip);
    const awaiting = orders.filter(isAwaitingShipment);
    const oldestToShip = toShip.reduce((m, o) => Math.min(m, o.created), Infinity);
    const oldestAwaiting = awaiting.reduce((m, o) => Math.min(m, o.created), Infinity);
    const d = (cur: number, prev: number | undefined) => (data.before ? change(cur, prev) : undefined);

    // Store conversion from the traffic tracking, for the same period (shown once tracking has data)
    const traffic = useTraffic(365);
    const conversion = useMemo(() => {
        if (!traffic.data) return null;
        const start = new Date(periodRange(period, orders).current.start);
        const from = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
        const t = sumDays(traffic.data.days.filter((day) => day.date >= from));
        return t.visitors ? { rate: (t.purchasers / t.visitors) * 100, visitors: t.visitors, purchasers: t.purchasers } : null;
    }, [traffic.data, period, orders]);

    return (
        <>
            <PageHeader
                title="Home"
                actions={
                    <Link href="/admin/orders/new" className={buttonClass("secondary")}>
                        Create order
                    </Link>
                }
            />
            {loadError && <LoadErrorCard />}

            <Card className="mb-4" title="To do">
                <ul className="divide-y divide-zinc-100">
                    <TodoRow
                        href="/admin/orders?tab=to_ship"
                        count={toShip.length}
                        title={toShip.length ? `${plural(toShip.length, "order")} to ship` : "No orders to ship"}
                        detail={toShip.length ? `Oldest is waiting ${plural(daysSince(oldestToShip), "day")}` : "Every paid order has a label or is shipped."}
                        urgent={toShip.length > 0 && daysSince(oldestToShip) >= 3}
                    />
                    <TodoRow
                        href="/admin/orders?tab=label_created"
                        count={awaiting.length}
                        title={awaiting.length ? `${plural(awaiting.length, "label")} created, not shipped yet` : "No labels waiting"}
                        detail={
                            awaiting.length
                                ? `Oldest order is from ${plural(daysSince(oldestAwaiting), "day")} ago. Mark them shipped once handed to the carrier.`
                                : "Nothing is waiting for drop-off."
                        }
                        urgent={awaiting.length > 0 && daysSince(oldestAwaiting) >= 7}
                    />
                    {pendingReviews.length > 0 && (
                        <TodoRow
                            href="/admin/reviews"
                            count={pendingReviews.length}
                            title={`${plural(pendingReviews.length, "review")} waiting for approval`}
                            detail="Read them and approve or hide each one."
                            urgent={false}
                        />
                    )}
                </ul>
            </Card>

            <div className="mb-3">
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                <KpiCard label="Net sales" value={money(data.now.netSales)} delta={d(data.now.netSales, data.before?.netSales)} hint="After refunds" />
                <KpiCard label="Orders" value={data.now.orders.toLocaleString("en-GB")} delta={d(data.now.orders, data.before?.orders)} />
                <KpiCard label="Average order value" value={money(data.now.aov)} delta={d(data.now.aov, data.before?.aov)} hint="Paid amount per order" />
                <KpiCard label="Refunds" value={money(data.now.refunds)} delta={d(data.now.refunds, data.before?.refunds)} upIsGood={false} hint="On orders placed in the period" />
                <KpiCard label="Items sold" value={data.now.itemsSold.toLocaleString("en-GB")} delta={d(data.now.itemsSold, data.before?.itemsSold)} />
            </div>

            {conversion && (
                <Link href="/admin/traffic" className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-zinc-200 bg-paper px-4 py-3 hover:bg-zinc-50">
                    <span className="text-[13px] font-medium text-zinc-700">Conversion rate</span>
                    <span className="text-lg font-semibold tabular-nums text-zinc-900">{conversion.rate.toFixed(1)}%</span>
                    <span className="text-xs text-zinc-600">
                        {conversion.purchasers} of {conversion.visitors.toLocaleString("en-GB")} visitors bought · see Traffic
                    </span>
                </Link>
            )}

            <Card className="mb-4" title={`Net sales · ${periodLabel(period)}`}>
                <div className="px-2 pb-3 pt-2 sm:px-4">
                    <BarChart buckets={data.buckets} />
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <Card
                    title="Recent orders"
                    action={
                        <Link href="/admin/orders" className="text-[13px] font-medium text-zinc-700 hover:text-zinc-900">
                            View all
                        </Link>
                    }
                >
                    <ul className="mt-2 divide-y divide-zinc-100">
                        {orders.slice(0, 8).map((o) => (
                            <li key={o.id}>
                                <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 sm:px-5">
                                    <div className="min-w-0 flex-1">
                                        <p className="flex items-center gap-2 text-sm">
                                            <span className="font-semibold text-zinc-900">#{o.number}</span>
                                            <span className="truncate text-zinc-800">{o.customer.name || o.shipping.name || o.customer.email}</span>
                                        </p>
                                        <p className="mt-0.5 text-xs text-zinc-600">{formatOrderDate(o.created)}</p>
                                    </div>
                                    <div className="hidden flex-shrink-0 gap-1.5 sm:flex">
                                        <PaymentBadge status={o.payment.status} />
                                        <FulfillmentBadge status={o.fulfillment.status} />
                                    </div>
                                    <span className="w-20 flex-shrink-0 text-right text-sm tabular-nums text-zinc-900">{money(o.amountTotal)}</span>
                                </Link>
                            </li>
                        ))}
                        {!orders.length && <li className="px-5 py-8 text-center text-sm text-zinc-600">No orders yet</li>}
                    </ul>
                </Card>
                <Card
                    title={`Top designs · ${periodLabel(period)}`}
                    action={
                        <Link href="/admin/analytics" className="text-[13px] font-medium text-zinc-700 hover:text-zinc-900">
                            Analytics
                        </Link>
                    }
                >
                    <div className="mt-1">
                        <RankList rows={data.designs} limit={5} unit=" sold" showRevenue />
                    </div>
                </Card>
            </div>
        </>
    );
}

function TodoRow({ href, count, title, detail, urgent }: { href: string; count: number; title: string; detail: string; urgent: boolean }) {
    return (
        <li>
            <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 sm:px-5">
                <span
                    className={cx(
                        "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold tabular-nums",
                        count === 0 ? "bg-zinc-100 text-zinc-700" : urgent ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900",
                    )}
                >
                    {count}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900">{title}</p>
                    <p className="text-xs text-zinc-600">{detail}</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-500" />
            </Link>
        </li>
    );
}
