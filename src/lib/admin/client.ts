"use client";

import { auth } from "@/lib/firebase";

// Local screenshots/testing only. NODE_ENV is inlined at build time, so this is always
// false in a production build, whatever NEXT_PUBLIC_ADMIN_DEV_BYPASS says.
export const DEV_BYPASS = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === "1";

export class AdminApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string,
    ) {
        super(message);
    }
}

async function token() {
    if (DEV_BYPASS) return "dev";
    const user = auth.currentUser;
    if (!user) throw new AdminApiError("Not signed in", 401);
    return user.getIdToken();
}

// JSON request to /api/admin/* with the signed-in admin's Firebase ID token
export async function adminFetch<T>(path: string, init: { method?: "GET" | "POST"; body?: unknown } = {}): Promise<T> {
    const res = await fetch(path, {
        method: init.method || "GET",
        headers: { Authorization: `Bearer ${await token()}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
        body: init.body ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
    });
    let data: unknown = null;
    try {
        data = await res.json();
    } catch {
        // empty body
    }
    if (!res.ok) {
        const err = data as { error?: string; code?: string } | null;
        throw new AdminApiError(err?.error || `Request failed (${res.status})`, res.status, err?.code);
    }
    return data as T;
}
