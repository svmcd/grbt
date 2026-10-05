import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/config";
import { recordEvent, TRACK_EVENTS, visitorFromRequest, type TrackEvent } from "@/lib/traffic";

// Store analytics events from the browser (see src/lib/track.ts). Always answers 204.
export async function POST(request: NextRequest) {
    try {
        const host = request.headers.get("host") || "";
        if (!host.endsWith("egrikuyu.com")) return new NextResponse(null, { status: 204 });
        const visitor = visitorFromRequest(request.headers);
        if (!visitor) return new NextResponse(null, { status: 204 });

        const body = JSON.parse((await request.text()) || "{}");
        if (!TRACK_EVENTS.includes(body.event)) return new NextResponse(null, { status: 204 });

        await recordEvent(
            {
                event: body.event as TrackEvent,
                path: typeof body.path === "string" ? body.path.slice(0, 200) : undefined,
                slug: typeof body.slug === "string" ? body.slug.slice(0, 80) : undefined,
                quantity: Math.min(50, Math.max(1, Number(body.quantity) || 1)),
                value: Math.max(0, Number(body.value) || 0),
                referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : undefined,
                utmSource: typeof body.utmSource === "string" ? body.utmSource : undefined,
                locale: request.cookies.get(LOCALE_COOKIE)?.value,
            },
            visitor
        );
    } catch (error) {
        console.error("track failed:", error);
    }
    return new NextResponse(null, { status: 204 });
}
