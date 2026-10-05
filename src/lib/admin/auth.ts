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

type AdminCheck = { admin: AdminUser } | { admin: null; reason: "unauthorized" | "email_unverified" };

async function checkAdmin(request: NextRequest): Promise<AdminCheck> {
    if (devBypass()) return { admin: { uid: "dev", email: "dev@localhost" } };
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return { admin: null, reason: "unauthorized" };
    try {
        const token = await adminAuth.verifyIdToken(header.slice(7));
        const email = (token.email || "").toLowerCase();
        if (!email || !adminEmails().includes(email)) return { admin: null, reason: "unauthorized" };
        // An allowlisted address only counts once its owner proved they control the inbox
        if (token.email_verified !== true) return { admin: null, reason: "email_unverified" };
        return { admin: { uid: token.uid, email } };
    } catch {
        return { admin: null, reason: "unauthorized" };
    }
}

export async function getAdmin(request: NextRequest): Promise<AdminUser | null> {
    return (await checkAdmin(request)).admin;
}

// Usage: const admin = await requireAdmin(req); if (admin instanceof NextResponse) return admin;
// An allowlisted account whose email is not verified gets 403 with code "email_unverified",
// so the admin can offer to send the verification email instead of a plain "no access".
export async function requireAdmin(request: NextRequest): Promise<AdminUser | NextResponse> {
    const check = await checkAdmin(request);
    if (check.admin) return check.admin;
    if (check.reason === "email_unverified") {
        return NextResponse.json({ error: "Verify your email address to use the admin", code: "email_unverified" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
