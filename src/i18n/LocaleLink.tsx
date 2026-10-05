"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocalizedHref } from "./LocaleProvider";

// next/link that keeps the URL's language: on /tr/… pages "/shipping" becomes "/tr/shipping".
// External links, anchors and object hrefs pass through unchanged.
export default function LocaleLink({ href, ...props }: ComponentProps<typeof NextLink>) {
    const localize = useLocalizedHref();
    const localized = typeof href === "string" && href.startsWith("/") && !href.startsWith("//") ? localize(href) : href;
    return <NextLink href={localized} {...props} />;
}
