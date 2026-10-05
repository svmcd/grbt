import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { abandonedCheckouts } from "@/lib/admin/stripe-sync";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    const days = Math.min(365, Number(request.nextUrl.searchParams.get("days")) || 90);
    try {
        return NextResponse.json({ checkouts: await abandonedCheckouts(days) });
    } catch (error) {
        console.error("Abandoned checkouts failed:", error);
        return NextResponse.json({ error: "Could not load abandoned checkouts" }, { status: 500 });
    }
}
