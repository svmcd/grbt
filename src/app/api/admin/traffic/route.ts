import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { readTraffic } from "@/lib/traffic";
import { titleCaseCity } from "@/lib/catalog";

export async function GET(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    const days = [7, 30, 90, 365].includes(Number(request.nextUrl.searchParams.get("days")))
        ? Number(request.nextUrl.searchParams.get("days"))
        : 30;
    return NextResponse.json(await readTraffic(days, titleCaseCity));
}
