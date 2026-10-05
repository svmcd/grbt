"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin, type AdminReview, type ReviewStatus } from "../_components/AdminProvider";
import { Badge, Button, Card, EmptyState, ExternalIcon, LoadingBlock, PageHeader, Tabs } from "../_components/ui";
import { formatDate, languageName } from "@/lib/admin/format";

const TABS: { key: ReviewStatus; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "hidden", label: "Hidden" },
];

export default function ReviewsPage() {
    const { reviews, reloadReviews } = useAdmin();
    const [tab, setTab] = useState<ReviewStatus>("pending");
    const list = reviews.reviews.filter((r) => r.status === tab).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const count = (s: ReviewStatus) => reviews.reviews.filter((r) => r.status === s).length;

    return (
        <>
            <PageHeader
                title="Reviews"
                meta={reviews.status === "ready" && <span className="text-sm text-zinc-700">{reviews.requestsSent} review requests sent</span>}
            />
            <div className="mb-3">
                <Tabs tabs={TABS.map((t) => ({ ...t, count: count(t.key) }))} value={tab} onChange={setTab} />
            </div>
            {reviews.status === "loading" ? (
                <Card>
                    <LoadingBlock label="Loading reviews" />
                </Card>
            ) : reviews.status === "error" ? (
                <Card>
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm text-red-800">{reviews.error}</p>
                        <Button className="mt-3" size="sm" onClick={reloadReviews}>
                            Try again
                        </Button>
                    </div>
                </Card>
            ) : !reviews.reviews.length ? (
                <Card>
                    <EmptyState title="No reviews yet">Customers get a review request by email 10 days after their order is marked as shipped.</EmptyState>
                </Card>
            ) : !list.length ? (
                <Card>
                    <EmptyState title={tab === "pending" ? "Nothing waiting for approval" : `No ${tab} reviews`} />
                </Card>
            ) : (
                <div className="space-y-3">
                    {list.map((r) => (
                        <ReviewCard key={r.id} review={r} />
                    ))}
                </div>
            )}
        </>
    );
}

function Stars({ rating }: { rating: number }) {
    const n = Math.max(0, Math.min(5, Math.round(rating)));
    return (
        <span className="inline-flex items-center gap-1.5" aria-label={`${n} out of 5 stars`}>
            <span className="text-base leading-none tracking-[0.1em] text-amber-500" aria-hidden>
                {"★".repeat(n)}
                <span className="text-zinc-300">{"★".repeat(5 - n)}</span>
            </span>
            <span className="text-[13px] font-medium tabular-nums text-zinc-800">{n}/5</span>
        </span>
    );
}

function ReviewCard({ review: r }: { review: AdminReview }) {
    const { orders, setReviewStatus, toast } = useAdmin();
    const [busy, setBusy] = useState<ReviewStatus | null>(null);
    const orderExists = orders.some((o) => o.id === r.orderId);

    const set = async (status: ReviewStatus) => {
        setBusy(status);
        try {
            await setReviewStatus(r.id, status);
            toast(status === "approved" ? "Review approved." : status === "hidden" ? "Review hidden." : "Review moved back to pending.");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Could not update the review", "error");
        } finally {
            setBusy(null);
        }
    };

    return (
        <Card>
            <div className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-zinc-600">{r.createdAt ? formatDate(r.createdAt) : ""}</span>
                </div>
                {r.text ? (
                    <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-900">{r.text}</p>
                ) : (
                    <p className="mt-2 text-sm text-zinc-600">No written review, rating only.</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-700">
                    <span className="font-medium text-zinc-900">{r.name || "Anonymous"}</span>
                    <a href={`/product/${r.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-zinc-900 underline-offset-2 hover:underline">
                        {r.productTitle || r.slug}
                        <ExternalIcon className="h-3.5 w-3.5" />
                    </a>
                    {r.orderId &&
                        (orderExists ? (
                            <Link href={`/admin/orders/${r.orderId}`} className="text-zinc-900 underline-offset-2 hover:underline">
                                Order #{r.orderNumber}
                            </Link>
                        ) : (
                            <span>Order #{r.orderNumber}</span>
                        ))}
                    {r.locale && <Badge>{languageName(r.locale)}</Badge>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
                    {r.status === "pending" && (
                        <>
                            <Button variant="primary" size="sm" loading={busy === "approved"} onClick={() => set("approved")}>
                                Approve
                            </Button>
                            <Button size="sm" loading={busy === "hidden"} onClick={() => set("hidden")}>
                                Hide
                            </Button>
                        </>
                    )}
                    {r.status === "approved" && (
                        <Button size="sm" loading={busy === "hidden"} onClick={() => set("hidden")}>
                            Hide
                        </Button>
                    )}
                    {r.status === "hidden" && (
                        <>
                            <Button size="sm" loading={busy === "pending"} onClick={() => set("pending")}>
                                Restore
                            </Button>
                            <Button variant="primary" size="sm" loading={busy === "approved"} onClick={() => set("approved")}>
                                Approve
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
