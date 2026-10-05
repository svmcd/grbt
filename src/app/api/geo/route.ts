import { isShippingCountry } from "@/lib/shipping";

export const dynamic = "force-dynamic";

// Visitor's country from Vercel's IP geolocation, used to preselect the cart's shipping country.
// null when unknown (local development) or when it is not a country we can ship to.
export async function GET(request: Request) {
    const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
    return Response.json(
        { country: isShippingCountry(country) ? country : null },
        { headers: { "Cache-Control": "private, no-store" } }
    );
}
