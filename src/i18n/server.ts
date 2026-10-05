import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, isLocale, matchLocale, type Locale } from "./config";
import type { Messages } from "./define";

// Locale for the current request: cookie first, then the browser's Accept-Language
export async function getLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
    if (isLocale(fromCookie)) return fromCookie;
    const headerStore = await headers();
    return matchLocale(headerStore.get("accept-language"));
}

export async function getMessages<T>(messages: Messages<T>): Promise<T> {
    return messages[await getLocale()];
}
