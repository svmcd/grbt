import { NextRequest, NextResponse } from "next/server";
import { productReviews, reviewRequest, submitReviews } from "@/lib/reviews";

// GET ?slug=konya → approved reviews for the product page
// GET ?token=…    → the review form for a customer's order
export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    const token = request.nextUrl.searchParams.get("token");
    if (slug) return NextResponse.json(await productReviews(slug), { headers: { "Cache-Control": "public, s-maxage=300" } });
    if (token) {
        const req = await reviewRequest(token);
        return req ? NextResponse.json(req) : NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "missing" }, { status: 400 });
}

// POST { token, name, reviews: [{ slug, rating, text }] }
export async function POST(request: NextRequest) {
    try {
        const { token, name, reviews } = await request.json();
        if (typeof token !== "string" || !Array.isArray(reviews)) return NextResponse.json({ error: "invalid" }, { status: 400 });
        const result = await submitReviews(
            token,
            String(name || ""),
            reviews.slice(0, 20).map((r: { slug?: unknown; rating?: unknown; text?: unknown }) => ({
                slug: String(r.slug || ""),
                rating: Number(r.rating),
                text: String(r.text || ""),
            }))
        );
        return result.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result.error }, { status: 400 });
    } catch (error) {
        console.error("Review submit failed:", error);
        return NextResponse.json({ error: "failed" }, { status: 500 });
    }
}
