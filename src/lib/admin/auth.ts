import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

// Only these accounts may use the admin. Anyone can create a Firebase account with the
// public web key, so being signed in is not enough. Override with ADMIN_EMAILS (comma separated).
const DEFAULT_ADMINS = ["spolat0750@gmail.com", "elifsunaeraslan12@gmail.com"];

export function adminEmails(): string[] {
    const fromEnv = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return fromEnv.length ? fromEnv : DEFAULT_ADMINS;
}

export type AdminUser = { uid: string; email: string };

// Local screenshots/testing only: never active outside `next dev`, and only with ADMIN_DEV_BYPASS=1 in .env.local
export const devBypass = () => process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_BYPASS === "1";

export async function getAdmin(request: NextRequest): Promise<AdminUser | null> {
    if (devBypass()) return { uid: "dev", email: "dev@localhost" };
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return null;
    try {
        const token = await adminAuth.verifyIdToken(header.slice(7));
        const email = (token.email || "").toLowerCase();
        if (!email || !adminEmails().includes(email)) return null;
        return { uid: token.uid, email };
    } catch {
        return null;
    }
}

// Usage: const admin = await requireAdmin(req); if (admin instanceof NextResponse) return admin;
export async function requireAdmin(request: NextRequest): Promise<AdminUser | NextResponse> {
    const admin = await getAdmin(request);
    return admin ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
