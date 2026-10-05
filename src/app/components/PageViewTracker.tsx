"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { markInternalDevice, track } from "@/lib/track";

// One page_view per route change. The first one carries the referrer and utm_source,
// which decide the visitor's traffic source.
export function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const first = useRef(true);

    useEffect(() => {
        if (pathname.startsWith("/admin")) {
            markInternalDevice();
            return;
        }
        track("page_view", {
            path: pathname,
            ...(first.current
                ? { referrer: document.referrer || undefined, utmSource: searchParams.get("utm_source") || undefined }
                : {}),
        });
        first.current = false;
    }, [pathname, searchParams]);

    return null;
}
