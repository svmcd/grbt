import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, LOCALE_HEADER, PATH_HEADER, defaultLocale, isLocale, matchLocale, type Locale } from "./config";
import type { Messages } from "./define";

// Locale for the current request: the URL prefix (/de/…, set by the middleware as a
// request header) first, then the cookie, then the browser's Accept-Language
export async function getLocale(): Promise<Locale> {
    const headerStore = await headers();
    const fromUrl = headerStore.get(LOCALE_HEADER);
    if (isLocale(fromUrl)) return fromUrl;
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
    if (isLocale(fromCookie)) return fromCookie;
    return matchLocale(headerStore.get("accept-language"));
}

// The language of the URL itself: the prefix, or English for unprefixed URLs.
// Canonical and hreflang links use this; page text uses getLocale().
export async function getUrlLocale(): Promise<Locale> {
    const fromUrl = (await headers()).get(LOCALE_HEADER);
    return isLocale(fromUrl) ? fromUrl : defaultLocale;
}

// The request path without its locale prefix ("/product/konya"), or null outside the middleware
export async function getRequestPath(): Promise<string | null> {
    return (await headers()).get(PATH_HEADER);
}

export async function getMessages<T>(messages: Messages<T>): Promise<T> {
    return messages[await getLocale()];
}
