"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAdmin } from "../../_components/AdminProvider";
import { FulfillmentCard } from "../../_components/order/FulfillmentCard";
import { ItemsCard } from "../../_components/order/ItemsCard";
import { PaymentCard } from "../../_components/order/PaymentCard";
import { AddressCard, CustomerCard, NotesCard, Timeline } from "../../_components/order/SideCards";
import { Badge, Button, Card, Dialog, EmptyState, FulfillmentBadge, PageHeader, PaymentBadge, PrintIcon, buttonClass } from "../../_components/ui";
import { adminFetch } from "@/lib/admin/client";
import { formatDateTime } from "@/lib/admin/format";
import { customerKey } from "@/lib/admin/metrics";

export default function OrderPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { orders, orderAction, removeOrder, toast } = useAdmin();
    const order = orders.find((o) => o.id === decodeURIComponent(id));
    const [busy, setBusy] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const otherOrders = useMemo(() => {
        if (!order) return [];
        const key = customerKey(order.customer.email, order.customer.name || order.shipping.name);
        return orders.filter((o) => o.id !== order.id && customerKey(o.customer.email, o.customer.name || o.shipping.name) === key);
    }, [orders, order]);

    if (!order) {
        return (
            <>
                <PageHeader title="Order not found" back={{ href: "/admin/orders", label: "Orders" }} />
                <Card>
                    <EmptyState title="This order does not exist or was deleted." />
                </Card>
            </>
        );
    }

    const toggleArchive = async () => {
        setBusy("archive");
        try {
            await orderAction("update", order.id, { data: { archived: !order.archived } });
            toast(order.archived ? "Order unarchived." : "Order archived.");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not update the order", "error");
        } finally {
            setBusy(null);
        }
    };

    const remove = async () => {
        setBusy("delete");
        try {
            await adminFetch("/api/admin/orders", { method: "POST", body: { action: "delete", orderId: order.id } });
            removeOrder(order.id);
            toast(`Order #${order.number} deleted.`);
            router.push("/admin/orders");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not delete the order", "error");
            setBusy(null);
        }
    };

    return (
        <>
            <PageHeader
                back={{ href: "/admin/orders", label: "Orders" }}
                title={`#${order.number}`}
                meta={
                    <>
                        <PaymentBadge status={order.payment.status} />
                        <FulfillmentBadge status={order.fulfillment.status} />
                        {order.archived && <Badge>Archived</Badge>}
                        {order.manual && <Badge>Manual order</Badge>}
                        <span className="w-full text-[13px] text-zinc-700 sm:w-auto">{formatDateTime(order.created)}</span>
                    </>
                }
                actions={
                    <>
                        <Link href={`/admin/orders/${order.id}/slip`} target="_blank" className={buttonClass("secondary")}>
                            <PrintIcon className="h-4 w-4" />
                            Packing slip
                        </Link>
                        <Button loading={busy === "archive"} onClick={toggleArchive}>
                            {order.archived ? "Unarchive" : "Archive"}
                        </Button>
                        <Button variant="dangerGhost" onClick={() => setConfirmDelete(true)}>
                            Delete
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_auto_auto_1fr]">
                <div className="lg:col-start-1">
                    <ItemsCard order={order} />
                </div>
                <div className="lg:col-start-1">
                    <FulfillmentCard key={`${order.id}-${order.fulfillment.status}`} order={order} />
                </div>
                <div className="space-y-4 lg:col-start-2 lg:row-span-4 lg:row-start-1">
                    <CustomerCard order={order} otherOrders={otherOrders} />
                    <AddressCard order={order} />
                    <NotesCard order={order} />
                </div>
                <div className="lg:col-start-1">
                    <PaymentCard order={order} />
                </div>
                <div className="lg:col-start-1">
                    <Timeline order={order} />
                </div>
            </div>

            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title={`Delete order #${order.number}?`}
                footer={
                    <>
                        <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
                        <Button variant="danger" loading={busy === "delete"} onClick={remove}>
                            Delete order
                        </Button>
                    </>
                }
            >
                The order disappears from the admin and from all reports. It is not refunded: refunds are made in Stripe. To only hide it from the to-do lists, archive it
                instead.
            </Dialog>
        </>
    );
}
