import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_HEADER, PATH_HEADER, defaultLocale, isLocale, isLocalizablePath, matchLocale, splitLocalePrefix } from "@/i18n/config";

const OLD_HOSTS = new Set(["grbt.studio", "www.grbt.studio"]);

const COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };

export function middleware(request: NextRequest) {
    // Rebrand: old domain pages move to egrikuyu.com. API routes are not matched,
    // so webhooks that still call grbt.studio keep working.
    if (OLD_HOSTS.has(request.headers.get("host") ?? "")) {
        const url = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://egrikuyu.com");
        return NextResponse.redirect(url, 308);
    }

    // /TR/… and /De/… → lowercase prefix
    const firstSegment = request.nextUrl.pathname.split("/")[1] ?? "";
    if (firstSegment !== firstSegment.toLowerCase() && isLocale(firstSegment.toLowerCase())) {
        const url = request.nextUrl.clone();
        url.pathname = `/${firstSegment.toLowerCase()}${request.nextUrl.pathname.slice(firstSegment.length + 1)}`;
        return NextResponse.redirect(url, 308);
    }

    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    const { locale: urlLocale, path } = splitLocalePrefix(request.nextUrl.pathname);

    // /en/… and prefixed paths that only exist once (/de/admin, /tr/feed.xml) go to the plain URL
    if (urlLocale && (urlLocale === defaultLocale || !isLocalizablePath(path))) {
        const url = request.nextUrl.clone();
        url.pathname = path;
        const response = NextResponse.redirect(url, 308);
        if (urlLocale === defaultLocale && cookieLocale !== defaultLocale) response.cookies.set(LOCALE_COOKIE, defaultLocale, COOKIE_OPTIONS);
        return response;
    }

    // Never trust these from the client: only the middleware sets them
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete(LOCALE_HEADER);
    requestHeaders.set(PATH_HEADER, path);

    let response: NextResponse;
    if (urlLocale) {
        // /tr/product/konya renders /product/konya in Turkish. The cookie keeps client
        // components and later unprefixed links in the same language.
        requestHeaders.set(LOCALE_HEADER, urlLocale);
        const url = request.nextUrl.clone();
        url.pathname = path;
        response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
        if (cookieLocale !== urlLocale) response.cookies.set(LOCALE_COOKIE, urlLocale, COOKIE_OPTIONS);
    } else {
        response = NextResponse.next({ request: { headers: requestHeaders } });
        // First visit: remember the browser's language so server and client render the same locale
        if (!isLocale(cookieLocale)) {
            response.cookies.set(LOCALE_COOKIE, matchLocale(request.headers.get("accept-language")), COOKIE_OPTIONS);
        }
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
