"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { AdminApiError, DEV_BYPASS, adminFetch } from "@/lib/admin/client";
import type { AdminOrder } from "@/lib/admin/orders";

const AUTO_SYNC_AFTER_MS = 10 * 60 * 1000;

type AccessState = "loading" | "signed_out" | "no_access" | "ready";
type Toast = { id: number; message: string; tone: "success" | "error" };

export type ReviewStatus = "pending" | "approved" | "hidden";
export type AdminReview = {
    id: string;
    orderId: string;
    orderNumber: string;
    slug: string;
    productTitle: string;
    rating: number; // 1-5
    text: string;
    name: string;
    locale: string;
    createdAt: string;
    status: ReviewStatus;
};
// "missing": the reviews API does not exist yet (404); shown as the empty state
type ReviewsState = { status: "loading" | "ready" | "missing" | "error"; reviews: AdminReview[]; requestsSent: number; error?: string };

type AdminContextValue = {
    access: AccessState;
    email: string;
    orders: AdminOrder[];
    ordersLoaded: boolean;
    loadError: string | null;
    lastSync: string | null;
    syncing: boolean;
    reload: () => Promise<void>;
    sync: () => Promise<void>;
    // Runs a POST /api/admin/orders action and puts the returned order in the store
    orderAction: (action: string, orderId: string, extra?: Record<string, unknown>) => Promise<AdminOrder>;
    removeOrder: (id: string) => void;
    signOut: () => Promise<void>;
    toast: (message: string, tone?: Toast["tone"]) => void;
    reviews: ReviewsState;
    reloadReviews: () => Promise<void>;
    setReviewStatus: (id: string, status: ReviewStatus) => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
    return ctx;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [access, setAccess] = useState<AccessState>("loading");
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [ordersLoaded, setOrdersLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const autoSynced = useRef(false);
    const [reviews, setReviews] = useState<ReviewsState>({ status: "loading", reviews: [], requestsSent: 0 });

    const email = DEV_BYPASS ? "dev@localhost" : user?.email || "";
    const signedIn = DEV_BYPASS || Boolean(user);

    const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, tone }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    }, []);

    const reload = useCallback(async () => {
        try {
            const data = await adminFetch<{ orders: AdminOrder[]; lastSync: { syncedAt?: string } | null }>("/api/admin/orders");
            setOrders(data.orders);
            setLastSync(data.lastSync?.syncedAt || null);
            setOrdersLoaded(true);
            setLoadError(null);
            setAccess("ready");
        } catch (e) {
            if (e instanceof AdminApiError && e.status === 401) {
                setAccess("no_access");
                return;
            }
            setLoadError(e instanceof Error ? e.message : "Could not load orders");
            setAccess("ready");
        }
    }, []);

    const sync = useCallback(async () => {
        setSyncing(true);
        try {
            const res = await adminFetch<{ syncedAt: string }>("/api/admin/sync", { method: "POST" });
            setLastSync(res.syncedAt);
            await reload();
        } catch (e) {
            toast(e instanceof Error ? e.message : "Stripe sync failed", "error");
        } finally {
            setSyncing(false);
        }
    }, [reload, toast]);

    // Sign-in state → first load
    useEffect(() => {
        if (!DEV_BYPASS && authLoading) return;
        if (!signedIn) {
            setAccess("signed_out");
            setOrders([]);
            setOrdersLoaded(false);
            autoSynced.current = false;
            return;
        }
        setAccess("loading");
        reload();
    }, [authLoading, signedIn, user?.uid, reload]);

    // Pull refunds from Stripe when the last sync is older than 10 minutes
    useEffect(() => {
        if (access !== "ready" || !ordersLoaded || autoSynced.current) return;
        autoSynced.current = true;
        if (!lastSync || Date.now() - new Date(lastSync).getTime() > AUTO_SYNC_AFTER_MS) sync();
    }, [access, ordersLoaded, lastSync, sync]);

    const orderAction = useCallback(async (action: string, orderId: string, extra: Record<string, unknown> = {}) => {
        const res = await adminFetch<{ ok: boolean; order: AdminOrder }>("/api/admin/orders", {
            method: "POST",
            body: { action, orderId, ...extra },
        });
        setOrders((list) => list.map((o) => (o.id === res.order.id ? res.order : o)));
        return res.order;
    }, []);

    const reloadReviews = useCallback(async () => {
        try {
            const res = await adminFetch<{ reviews: AdminReview[]; requestsSent: number }>("/api/admin/reviews");
            setReviews({ status: "ready", reviews: res.reviews || [], requestsSent: res.requestsSent || 0 });
        } catch (e) {
            if (e instanceof AdminApiError && e.status === 404) setReviews({ status: "missing", reviews: [], requestsSent: 0 });
            else setReviews((r) => ({ ...r, status: "error", error: e instanceof Error ? e.message : "Could not load reviews" }));
        }
    }, []);

    // Reviews load once the admin is in (the sidebar badge and Home need the pending count)
    useEffect(() => {
        if (access === "ready") reloadReviews();
    }, [access, reloadReviews]);

    const setReviewStatus = useCallback(async (id: string, status: ReviewStatus) => {
        const res = await adminFetch<{ ok: boolean; review?: AdminReview }>("/api/admin/reviews", { method: "POST", body: { id, status } });
        setReviews((r) => ({ ...r, reviews: r.reviews.map((x) => (x.id === id ? { ...x, ...(res.review || {}), status: res.review?.status || status } : x)) }));
    }, []);

    const removeOrder = useCallback((id: string) => setOrders((list) => list.filter((o) => o.id !== id)), []);

    const signOut = useCallback(async () => {
        if (DEV_BYPASS) return;
        await firebaseSignOut(auth);
    }, []);

    const value = useMemo<AdminContextValue>(
        () => ({ access, email, orders, ordersLoaded, loadError, lastSync, syncing, reload, sync, orderAction, removeOrder, signOut, toast, reviews, reloadReviews, setReviewStatus }),
        [access, email, orders, ordersLoaded, loadError, lastSync, syncing, reload, sync, orderAction, removeOrder, signOut, toast, reviews, reloadReviews, setReviewStatus],
    );

    return (
        <AdminContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 print:hidden">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role="status"
                        className={`pointer-events-auto rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
                            t.tone === "error" ? "bg-red-600 text-paper" : "bg-zinc-900 text-paper"
                        }`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </AdminContext.Provider>
    );
}
