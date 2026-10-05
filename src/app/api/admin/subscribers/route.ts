import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin/auth";

// Newsletter sign-ups (Firestore "waitlist"), one row per email, oldest sign-up kept.
export async function GET(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    const snap = await adminDb.collection("waitlist").get();
    const byEmail = new Map<string, { email: string; createdAt: string | null; source: string }>();
    snap.forEach((d) => {
        const v = d.data();
        const email = String(v.email || "").trim().toLowerCase();
        if (!email) return;
        const ts = v.timestamp?.toDate ? v.timestamp.toDate().toISOString() : typeof v.timestamp === "string" ? v.timestamp : null;
        const prev = byEmail.get(email);
        if (!prev || (ts && prev.createdAt && ts < prev.createdAt)) byEmail.set(email, { email, createdAt: ts, source: v.source || "" });
    });
    const subscribers = [...byEmail.values()].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return NextResponse.json({ subscribers });
}
