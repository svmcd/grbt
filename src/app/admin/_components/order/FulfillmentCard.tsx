"use client";

import { useState } from "react";
import type { AdminOrder } from "@/lib/admin/orders";
import { formatDateTime } from "@/lib/admin/format";
import { useAdmin } from "../AdminProvider";
import { Button, Card, Dialog, ExternalIcon, Field, FulfillmentBadge, inputClass, selectClass } from "../ui";

type Provider = "PostNL" | "DHL";

export function FulfillmentCard({ order }: { order: AdminOrder }) {
    const { orderAction, sendCustomerEmail, toast } = useAdmin();
    const f = order.fulfillment;
    // Emailing is the default the first time an order moves on; editing the tracking of an order that
    // is already shipped does not email unless asked (there is "Resend tracking email" for that)
    const [emailCustomer, setEmailCustomer] = useState(f.status !== "shipped");
    const [confirmResend, setConfirmResend] = useState(false);
    const [shipForm, setShipForm] = useState(false);
    const [provider, setProvider] = useState<Provider>((f.trackingProvider as Provider) || "PostNL");
    const [code, setCode] = useState(f.trackingCode || "");
    const [busy, setBusy] = useState<string | null>(null);
    const [confirmUndo, setConfirmUndo] = useState(false);
    const canEmail = Boolean(order.customer.email);
    const willEmail = emailCustomer && canEmail;

    const sendEmail = async (status: "label_created" | "shipped_out", updated: AdminOrder, resend = false) => {
        try {
            await sendCustomerEmail(updated.id, status, { resend });
            return true;
        } catch {
            toast(
                resend && updated === order
                    ? "The email could not be sent. Try again or email the customer yourself."
                    : "Saved, but the email to the customer failed. Try again or email them yourself.",
                "error",
            );
            return false;
        }
    };

    const markLabel = async () => {
        setBusy("label");
        try {
            const updated = await orderAction("mark_label", order.id);
            const sent = willEmail ? await sendEmail("label_created", updated) : false;
            toast(sent ? "Label created. Customer emailed." : "Marked as label created.");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not update the order", "error");
        } finally {
            setBusy(null);
        }
    };

    const markShipped = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setBusy("ship");
        const editing = f.status === "shipped";
        try {
            const updated = await orderAction("mark_shipped", order.id, { trackingProvider: provider, trackingCode: code.trim() });
            const sent = willEmail ? await sendEmail("shipped_out", updated, editing) : false;
            setShipForm(false);
            if (editing) toast(sent ? "Tracking saved. Customer emailed the new tracking link." : "Tracking saved. The customer was not emailed.");
            else toast(sent ? "Marked as shipped. Customer emailed the tracking link." : "Marked as shipped.");
        } catch (err) {
            toast(err instanceof Error ? err.message : "Could not update the order", "error");
        } finally {
            setBusy(null);
        }
    };

    const resendTracking = async () => {
        setBusy("resend");
        const sent = await sendEmail("shipped_out", order, true);
        setBusy(null);
        setConfirmResend(false);
        if (sent) toast(`Tracking email sent to ${order.customer.email}.`);
    };

    const markUnfulfilled = async () => {
        setBusy("undo");
        try {
            await orderAction("mark_unfulfilled", order.id);
            setConfirmUndo(false);
            toast("Marked as unfulfilled.");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not update the order", "error");
        } finally {
            setBusy(null);
        }
    };

    const emailBox = (
        <label className={`flex items-center gap-2 text-[13px] ${canEmail ? "text-zinc-800" : "text-zinc-600"}`}>
            <input type="checkbox" className="h-4 w-4 accent-zinc-900" checked={willEmail} disabled={!canEmail} onChange={(e) => setEmailCustomer(e.target.checked)} />
            {canEmail ? "Email the customer" : "No customer email on this order"}
        </label>
    );

    const showShipForm = shipForm || f.status === "label_created";

    return (
        <Card
            title={
                <span className="flex items-center gap-2">
                    Fulfillment <FulfillmentBadge status={f.status} />
                </span>
            }
        >
            <div className="space-y-3 px-4 pb-4 pt-3 sm:px-5">
                {order.payment.status === "refunded" && f.status !== "shipped" && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-900">This order is fully refunded. It usually does not need to be shipped.</p>
                )}

                <Steps status={f.status} />

                {f.status === "shipped" && (
                    <div className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm">
                        {f.trackingCode ? (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-zinc-600">{f.trackingProvider || "Tracking"}</p>
                                    <p className="font-mono text-[13px] text-zinc-900">{f.trackingCode}</p>
                                </div>
                                {f.trackingUrl && (
                                    <a href={f.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-zinc-900 hover:underline">
                                        Track parcel <ExternalIcon className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-zinc-700">No tracking code saved.</p>
                        )}
                        {f.shippedAt && <p className="mt-1 text-xs text-zinc-600">Shipped {formatDateTime(f.shippedAt)}</p>}
                    </div>
                )}

                {f.status === "unfulfilled" && !shipForm && (
                    <div className="flex flex-col gap-3">
                        {emailBox}
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" loading={busy === "label"} onClick={markLabel}>
                                Mark label created
                            </Button>
                            <Button onClick={() => setShipForm(true)}>Mark as shipped</Button>
                        </div>
                    </div>
                )}

                {showShipForm && f.status !== "shipped" && (
                    <ShipForm
                        provider={provider}
                        setProvider={setProvider}
                        code={code}
                        setCode={setCode}
                        onSubmit={markShipped}
                        busy={busy === "ship"}
                        emailBox={emailBox}
                        onCancel={f.status === "unfulfilled" ? () => setShipForm(false) : undefined}
                    />
                )}

                {f.status === "shipped" && shipForm && (
                    <ShipForm
                        provider={provider}
                        setProvider={setProvider}
                        code={code}
                        setCode={setCode}
                        onSubmit={markShipped}
                        busy={busy === "ship"}
                        emailBox={emailBox}
                        submitLabel="Save tracking"
                        onCancel={() => setShipForm(false)}
                    />
                )}

                {f.status !== "unfulfilled" && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-[13px]">
                        {f.status === "shipped" && !shipForm && (
                            <button className="font-medium text-zinc-800 hover:text-zinc-950 hover:underline" onClick={() => setShipForm(true)}>
                                Change tracking
                            </button>
                        )}
                        {f.status === "shipped" && !shipForm && f.trackingCode && canEmail && (
                            <button className="font-medium text-zinc-800 hover:text-zinc-950 hover:underline" onClick={() => setConfirmResend(true)}>
                                Resend tracking email
                            </button>
                        )}
                        <button className="font-medium text-zinc-800 hover:text-zinc-950 hover:underline" onClick={() => setConfirmUndo(true)}>
                            Mark as unfulfilled
                        </button>
                    </div>
                )}
            </div>

            <Dialog
                open={confirmUndo}
                onClose={() => setConfirmUndo(false)}
                title="Mark as unfulfilled?"
                footer={
                    <>
                        <Button onClick={() => setConfirmUndo(false)}>Cancel</Button>
                        <Button variant="primary" loading={busy === "undo"} onClick={markUnfulfilled}>
                            Mark as unfulfilled
                        </Button>
                    </>
                }
            >
                The order goes back to “To ship”. The customer is not emailed. The saved tracking code stays on the order.
            </Dialog>

            <Dialog
                open={confirmResend}
                onClose={() => setConfirmResend(false)}
                title="Resend the tracking email?"
                footer={
                    <>
                        <Button onClick={() => setConfirmResend(false)}>Cancel</Button>
                        <Button variant="primary" loading={busy === "resend"} onClick={resendTracking}>
                            Send email
                        </Button>
                    </>
                }
            >
                {order.customer.email} gets the shipping email again with {f.trackingProvider} tracking code {f.trackingCode}. The order status does not change.
            </Dialog>
        </Card>
    );
}

function Steps({ status }: { status: AdminOrder["fulfillment"]["status"] }) {
    const steps = ["Unfulfilled", "Label created", "Shipped"];
    const at = status === "shipped" ? 2 : status === "label_created" ? 1 : 0;
    return (
        <ol className="flex items-center gap-1 text-xs">
            {steps.map((s, i) => (
                <li key={s} className="flex flex-1 items-center gap-1">
                    <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                            i <= at ? "bg-zinc-900 text-paper" : "bg-zinc-200 text-zinc-700"
                        }`}
                    >
                        {i + 1}
                    </span>
                    <span className={`truncate ${i === at ? "font-semibold text-zinc-900" : "text-zinc-700"}`}>{s}</span>
                    {i < steps.length - 1 && <span className={`h-px flex-1 ${i < at ? "bg-zinc-900" : "bg-zinc-200"}`} />}
                </li>
            ))}
        </ol>
    );
}

function ShipForm({
    provider,
    setProvider,
    code,
    setCode,
    onSubmit,
    busy,
    emailBox,
    onCancel,
    submitLabel = "Mark as shipped",
}: {
    provider: Provider;
    setProvider: (p: Provider) => void;
    code: string;
    setCode: (c: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    busy: boolean;
    emailBox: React.ReactNode;
    onCancel?: () => void;
    submitLabel?: string;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
                <Field label="Carrier">
                    <select value={provider} onChange={(e) => setProvider(e.target.value as Provider)} className={selectClass}>
                        <option value="PostNL">PostNL</option>
                        <option value="DHL">DHL</option>
                    </select>
                </Field>
                <Field label="Tracking code">
                    <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="3S..." className={`${inputClass} font-mono`} />
                </Field>
            </div>
            {emailBox}
            <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary" loading={busy} disabled={!code.trim()}>
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
