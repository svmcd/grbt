import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { lastSync, syncWithStripe } from "@/lib/admin/stripe-sync";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    return NextResponse.json({ lastSync: await lastSync() });
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    // Full resync (every session ever made): ?full=1 or { "full": true }. Default: only what changed
    // since the last complete sync.
    let full = request.nextUrl.searchParams.get("full") === "1";
    try {
        const body = await request.json();
        if (body?.full === true) full = true;
    } catch {
        // no body
    }
    try {
        return NextResponse.json(await syncWithStripe({ full }));
    } catch (error) {
        console.error("Stripe sync failed:", error);
        return NextResponse.json({ error: "Stripe sync failed" }, { status: 500 });
    }
}
