import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin/auth";
import { allReviews, setReviewStatus, type ReviewStatus } from "@/lib/reviews";

export async function GET(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    const requests = await adminDb.collection("orders").where("review_requested_at", ">", "").count().get();
    return NextResponse.json({ reviews: await allReviews(), requestsSent: requests.data().count });
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    const { id, status } = (await request.json()) as { id?: string; status?: ReviewStatus };
    if (!id || !["pending", "approved", "hidden"].includes(status || "")) return NextResponse.json({ error: "invalid" }, { status: 400 });
    return NextResponse.json({ ok: true, review: await setReviewStatus(id, status!) });
}
