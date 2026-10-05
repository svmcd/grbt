"use client";

import { usePlainPathname } from "@/i18n/LocaleProvider";

// Wraps the shop chrome (header, footer, cart drawer, analytics) so it is not rendered
// on the admin back office, which has its own layout.
export function StoreChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePlainPathname();
    if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
    return <>{children}</>;
}
