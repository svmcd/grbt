"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "../_components/AdminProvider";
import { BarChart } from "../_components/BarChart";
import { LoadErrorCard } from "../_components/LoadErrorCard";
import { PeriodTabs, RankList, periodLabel } from "../_components/reports";
import { Card, PageHeader } from "../_components/ui";
import { countryName, languageName, money, percent } from "@/lib/admin/format";
import { groupCustomers, inRange, isSale, kpis, periodRange, salesBuckets, shippingDays, tallyItems, tallyOrders, type PeriodKey } from "@/lib/admin/metrics";

export default function AnalyticsPage() {
    const { orders } = useAdmin();
    const [period, setPeriod] = useState<PeriodKey>("12m");

    const a = useMemo(() => {
        const { current } = periodRange(period, orders);
        const list = orders.filter((o) => inRange(o, current));
        const sales = list.filter(isSale);
        const kept = sales.filter((o) => o.payment.status !== "refunded");
        const items = kept.flatMap((o) => o.items);
        const itemQty = items.reduce((s, i) => s + i.quantity, 0);
        const persItems = items.filter((i) => i.personalization).reduce((s, i) => s + i.quantity, 0);
        const persOrders = kept.filter((o) => o.items.some((i) => i.personalization)).length;
        const giftOrders = kept.filter((o) => o.items.some((i) => i.gift)).length;
        const customers = groupCustomers(sales);
        const refundedOrders = sales.filter((o) => o.payment.refundedAmount > 0).length;
        return {
            k: kpis(list),
            sales,
            kept,
            buckets: salesBuckets(orders, current, period),
            designs: tallyItems(list, (i) => i.title),
            types: tallyItems(list, (i) => i.productType),
            colors: tallyItems(list, (i) => (i.productType === "Phone case" ? "" : i.color)).filter((t) => t.label !== "Not specified"),
            sizes: tallyItems(list, (i) => (i.productType === "Phone case" ? "" : i.size)).filter((t) => t.label !== "Not specified"),
            phoneModels: tallyItems(list, (i) => (i.productType === "Phone case" ? i.size : "")).filter((t) => t.label !== "Not specified"),
            countries: tallyOrders(list, (o) => o.shipping.country),
            languages: tallyOrders(list, (o) => o.locale),
            itemQty,
            persItems,
            persOrders,
            giftOrders,
            customers: customers.length,
            repeat: customers.filter((c) => c.orderCount > 1).length,
            refundedOrders,
            shipping: shippingDays(sales),
        };
    }, [orders, period]);

    const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
    const sizes = [...a.sizes].sort((x, y) => {
        const ix = SIZE_ORDER.indexOf(x.label);
        const iy = SIZE_ORDER.indexOf(y.label);
        return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
    });

    return (
        <>
            <PageHeader title="Analytics" />
            <LoadErrorCard />
            <div className="mb-4">
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Rate label="Net sales" value={money(a.k.netSales)} detail={`${money(a.k.grossSales)} paid, ${money(a.k.refunds)} refunded`} />
                <Rate label="Orders" value={String(a.k.orders)} detail={`${a.k.itemsSold} items sold`} />
                <Rate label="Refund rate" value={percent(a.refundedOrders, a.sales.length)} detail={`${a.refundedOrders} of ${a.sales.length} orders · ${percent(a.k.refunds, a.k.grossSales)} of sales`} />
                <Rate
                    label="Repeat customers"
                    value={percent(a.repeat, a.customers)}
                    detail={`${a.repeat} of ${a.customers} customers ordered more than once`}
                />
                <Rate label="Personalization" value={percent(a.persOrders, a.kept.length)} detail={`of orders · ${a.persItems} of ${a.itemQty} items`} />
                <Rate label="Gift package" value={percent(a.giftOrders, a.kept.length)} detail={`${a.giftOrders} of ${a.kept.length} orders`} />
                <Rate label="Average order value" value={money(a.k.aov)} detail="Paid amount per order" />
                <Rate
                    label="Order to shipped"
                    value={a.shipping.average !== null ? `${a.shipping.average.toFixed(1)} days` : "No data yet"}
                    detail={
                        a.shipping.count
                            ? `Average over ${a.shipping.count} order${a.shipping.count === 1 ? "" : "s"} with a recorded ship date`
                            : "Ship dates are recorded when an order is marked as shipped"
                    }
                />
            </div>

            <Card className="mb-4" title={`Net sales · ${periodLabel(period)}`}>
                <div className="px-2 pb-3 pt-2 sm:px-4">
                    <BarChart buckets={a.buckets} />
                </div>
            </Card>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                    <Card title="Best-selling designs">
                        <p className="px-4 pt-1 text-xs text-zinc-600 sm:px-5">Quantity and revenue, fully refunded orders left out</p>
                        <div className="mt-1">
                            <RankList rows={a.designs} showRevenue />
                        </div>
                    </Card>
                    <Card title="Colors">
                        <div className="mt-1">
                            <RankList rows={a.colors} />
                        </div>
                    </Card>
                    <Card title="Customer languages" action={<span className="text-xs text-zinc-600">Language of the shop at checkout</span>}>
                        <div className="mt-1">
                            <RankList rows={a.languages} metric="orders" labelFor={languageName} />
                        </div>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card title="Product types">
                        <div className="mt-1">
                            <RankList rows={a.types} showRevenue />
                        </div>
                    </Card>
                    <Card title="Sizes" action={<span className="text-xs text-zinc-600">Clothing, for stock planning</span>}>
                        <div className="mt-1">
                            <RankList rows={sizes} />
                        </div>
                    </Card>
                    <Card title="Countries" action={<span className="text-xs text-zinc-600">By orders</span>}>
                        <div className="mt-1">
                            <RankList rows={a.countries} metric="orders" showRevenue labelFor={(c) => (c === "Unknown" ? c : countryName(c))} />
                        </div>
                    </Card>
                    {a.phoneModels.length > 0 && (
                        <Card title="Phone case models">
                            <div className="mt-1">
                                <RankList rows={a.phoneModels} />
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

function Rate({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <Card className="px-4 py-3.5">
            <p className="text-[13px] font-medium text-zinc-700">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900">{value}</p>
            <p className="mt-0.5 text-xs leading-snug text-zinc-600">{detail}</p>
        </Card>
    );
}
