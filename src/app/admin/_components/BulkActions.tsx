"use client";

import { useState } from "react";
import type { AdminOrder } from "@/lib/admin/orders";
import { adminFetch } from "@/lib/admin/client";
import { useAdmin } from "./AdminProvider";
import { Button, Dialog, inputClass, selectClass } from "./ui";

type Provider = "PostNL" | "DHL";

// Actions for the selected orders on the orders list. Emails are opt-in here (off by default):
// a bulk run should never email a batch of customers by accident.
export function BulkActions({ selected, onDone }: { selected: AdminOrder[]; onDone: () => void }) {
    const { upsertOrders, orderAction, sendCustomerEmail, toast } = useAdmin();
    const [dialog, setDialog] = useState<"label" | "ship" | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [emailCustomers, setEmailCustomers] = useState(false);
    const [tracking, setTracking] = useState<Record<string, { provider: Provider; code: string }>>({});

    // Fully refunded orders are never packed, shipped or emailed in bulk
    const refunded = selected.filter((o) => o.payment.status === "refunded");
    const forLabel = selected.filter((o) => o.fulfillment.status === "unfulfilled" && o.payment.status !== "refunded");
    const forShip = selected.filter((o) => o.fulfillment.status !== "shipped" && o.payment.status !== "refunded");
    const archivable = selected.filter((o) => !o.archived);
    const unarchivable = selected.filter((o) => o.archived);

    const open = (d: "label" | "ship") => {
        setEmailCustomers(false);
        if (d === "ship") setTracking(Object.fromEntries(forShip.map((o) => [o.id, { provider: (o.fulfillment.trackingProvider as Provider) || "PostNL", code: o.fulfillment.trackingCode || "" }])));
        setDialog(d);
    };

    const bulk = async (op: "mark_label" | "archive" | "unarchive", list: AdminOrder[]) => {
        const res = await adminFetch<{ ok: boolean; orders: AdminOrder[]; skipped: string[] }>("/api/admin/orders", {
            method: "POST",
            body: { action: "bulk", op, orderIds: list.map((o) => o.id) },
        });
        upsertOrders(res.orders);
        return res;
    };

    // Sends one email per order, one after the other; returns how many failed
    const emailAll = async (ids: string[], type: "label_created" | "shipped_out") => {
        let failed = 0;
        for (const id of ids) {
            try {
                await sendCustomerEmail(id, type);
            } catch {
                failed++;
            }
        }
        return failed;
    };

    const markLabels = async () => {
        setBusy("label");
        try {
            const res = await bulk("mark_label", forLabel);
            const done = forLabel.filter((o) => !res.skipped.includes(o.id));
            const withEmail = emailCustomers ? done.filter((o) => o.customer.email).map((o) => o.id) : [];
            const failed = withEmail.length ? await emailAll(withEmail, "label_created") : 0;
            toast(
                `${done.length} marked as label created.` +
                    (withEmail.length ? ` ${withEmail.length - failed} customer${withEmail.length - failed === 1 ? "" : "s"} emailed.` : "") +
                    (failed ? ` ${failed} email${failed === 1 ? "" : "s"} failed.` : ""),
                failed ? "error" : "success",
            );
            setDialog(null);
            onDone();
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not update the orders", "error");
        } finally {
            setBusy(null);
        }
    };

    const markShipped = async () => {
        const list = forShip.filter((o) => tracking[o.id]?.code.trim());
        if (!list.length) return;
        setBusy("ship");
        let saved = 0;
        let failedSave = 0;
        let failedEmail = 0;
        let emailed = 0;
        for (const o of list) {
            const t = tracking[o.id];
            try {
                await orderAction("mark_shipped", o.id, { trackingProvider: t.provider, trackingCode: t.code.trim(), bulk: true });
                saved++;
            } catch {
                failedSave++;
                continue;
            }
            if (emailCustomers && o.customer.email) {
                try {
                    await sendCustomerEmail(o.id, "shipped_out");
                    emailed++;
                } catch {
                    failedEmail++;
                }
            }
        }
        setBusy(null);
        toast(
            `${saved} marked as shipped.` +
                (emailed ? ` ${emailed} customer${emailed === 1 ? "" : "s"} emailed.` : "") +
                (failedSave ? ` ${failedSave} could not be saved.` : "") +
                (failedEmail ? ` ${failedEmail} email${failedEmail === 1 ? "" : "s"} failed.` : ""),
            failedSave || failedEmail ? "error" : "success",
        );
        setDialog(null);
        onDone();
    };

    const archive = async (to: boolean) => {
        const list = to ? archivable : unarchivable;
        setBusy(to ? "archive" : "unarchive");
        try {
            await bulk(to ? "archive" : "unarchive", list);
            toast(`${list.length} order${list.length === 1 ? "" : "s"} ${to ? "archived" : "unarchived"}.`);
            onDone();
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not update the orders", "error");
        } finally {
            setBusy(null);
        }
    };

    const printSlips = () => {
        window.open(`/admin/orders/slips?ids=${selected.map((o) => encodeURIComponent(o.id)).join(",")}`, "_blank");
    };

    const emailBox = (count: number) => (
        <label className="mt-3 flex items-center gap-2 text-[13px] text-zinc-800">
            <input type="checkbox" className="h-4 w-4 accent-zinc-900" checked={emailCustomers} onChange={(e) => setEmailCustomers(e.target.checked)} />
            Email the customers ({count} with an email address)
        </label>
    );
    const shipReady = forShip.filter((o) => tracking[o.id]?.code.trim()).length;
    const refundedNote = refunded.length > 0 && (
        <p className="mb-2">
            {refunded.length} selected order{refunded.length === 1 ? " is" : "s are"} fully refunded and left out: no status change, no email.
        </p>
    );

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
                <span className="mr-1 text-[13px] font-medium text-zinc-900">{selected.length} selected</span>
                <Button size="sm" disabled={!forLabel.length} onClick={() => open("label")} title={forLabel.length ? undefined : "No unfulfilled orders selected (refunded orders are left out)"}>
                    Mark label created
                </Button>
                <Button size="sm" disabled={!forShip.length} onClick={() => open("ship")} title={forShip.length ? undefined : "All selected orders are shipped or refunded"}>
                    Mark shipped
                </Button>
                {archivable.length > 0 && (
                    <Button size="sm" loading={busy === "archive"} onClick={() => archive(true)}>
                        Archive{unarchivable.length ? ` (${archivable.length})` : ""}
                    </Button>
                )}
                {unarchivable.length > 0 && (
                    <Button size="sm" loading={busy === "unarchive"} onClick={() => archive(false)}>
                        Unarchive{archivable.length ? ` (${unarchivable.length})` : ""}
                    </Button>
                )}
                <Button size="sm" onClick={printSlips}>
                    Print packing slips
                </Button>
            </div>

            <Dialog
                open={dialog === "label"}
                onClose={() => setDialog(null)}
                title={`Mark ${forLabel.length} order${forLabel.length === 1 ? "" : "s"} as label created?`}
                footer={
                    <>
                        <Button onClick={() => setDialog(null)}>Cancel</Button>
                        <Button variant="primary" loading={busy === "label"} onClick={markLabels}>
                            Mark label created
                        </Button>
                    </>
                }
            >
                {forLabel.length + refunded.length < selected.length && (
                    <p className="mb-2">
                        {selected.length - forLabel.length - refunded.length} selected order{selected.length - forLabel.length - refunded.length === 1 ? " is" : "s are"} already
                        past this step and stay as they are.
                    </p>
                )}
                {refundedNote}
                <p>The orders move to “Label created”.</p>
                {emailBox(forLabel.filter((o) => o.customer.email).length)}
            </Dialog>

            <Dialog
                open={dialog === "ship"}
                onClose={() => setDialog(null)}
                title={`Mark as shipped`}
                footer={
                    <>
                        <Button onClick={() => setDialog(null)}>Cancel</Button>
                        <Button variant="primary" loading={busy === "ship"} disabled={!shipReady} onClick={markShipped}>
                            Mark {shipReady} shipped
                        </Button>
                    </>
                }
            >
                {refundedNote}
                <p className="mb-3">Enter the tracking code for each parcel. Orders left without a code are skipped.</p>
                <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                    {forShip.map((o) => {
                        const t = tracking[o.id] || { provider: "PostNL" as Provider, code: "" };
                        const set = (patch: Partial<typeof t>) => setTracking((cur) => ({ ...cur, [o.id]: { ...t, ...patch } }));
                        return (
                            <div key={o.id} className="rounded-lg border border-zinc-200 p-2">
                                <p className="mb-1.5 text-[13px] font-medium text-zinc-900">
                                    #{o.number} · {o.shipping.name || o.customer.name || "No name"}
                                </p>
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <select value={t.provider} onChange={(e) => set({ provider: e.target.value as Provider })} className={selectClass} aria-label={`Carrier for #${o.number}`}>
                                        <option value="PostNL">PostNL</option>
                                        <option value="DHL">DHL</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={t.code}
                                        onChange={(e) => set({ code: e.target.value })}
                                        placeholder="Tracking code"
                                        className={`${inputClass} font-mono`}
                                        aria-label={`Tracking code for #${o.number}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                {emailBox(forShip.filter((o) => o.customer.email && tracking[o.id]?.code.trim()).length)}
            </Dialog>
        </>
    );
}
