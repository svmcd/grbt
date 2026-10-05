import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, matchLocale } from "@/i18n/config";

const OLD_HOSTS = new Set(["grbt.studio", "www.grbt.studio"]);

export function middleware(request: NextRequest) {
    // Rebrand: old domain pages move to egrikuyu.com. API routes are not matched,
    // so webhooks that still call grbt.studio keep working.
    if (OLD_HOSTS.has(request.headers.get("host") ?? "")) {
        const url = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://egrikuyu.com");
        return NextResponse.redirect(url, 308);
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Check if user is authenticated (you'll need to implement this)
        // For now, we'll rely on client-side authentication
        // In production, you should verify the Firebase token here
    }

    const response = NextResponse.next();

    // First visit: remember the browser's language so server and client render the same locale
    if (!isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
        response.cookies.set(LOCALE_COOKIE, matchLocale(request.headers.get("accept-language")), {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
        });
    }

    // Security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Content Security Policy
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com;"
    );

    // HSTS (only in production)
    if (process.env.NODE_ENV === "production") {
        response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

