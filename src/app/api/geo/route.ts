import { isShippingCountry } from "@/lib/shipping";

export const dynamic = "force-dynamic";

// Visitor's country from Vercel's IP geolocation, used to preselect the cart's shipping country
// and for the delivery dates on the product page.
// country: the visitor's country when we can ship there, otherwise null.
// detected: the visitor's country as detected (also when we cannot ship there), null when unknown
// (local development).
export async function GET(request: Request) {
    const raw = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
    const detected = /^[A-Z]{2}$/.test(raw) && raw !== "XX" && raw !== "T1" ? raw : null;
    return Response.json(
        { country: isShippingCountry(detected) ? detected : null, detected },
        { headers: { "Cache-Control": "private, no-store" } }
    );
}
