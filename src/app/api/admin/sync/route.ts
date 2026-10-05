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
    try {
        return NextResponse.json(await syncWithStripe());
    } catch (error) {
        console.error("Stripe sync failed:", error);
        return NextResponse.json({ error: "Stripe sync failed" }, { status: 500 });
    }
}
