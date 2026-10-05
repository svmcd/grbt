import type { Metadata } from "next";
import { getMessages } from "@/i18n/server";
import common from "@/i18n/messages/common";
import collections from "@/i18n/messages/collections";
import { SITE_URL } from "@/lib/seo/products";

export async function generateMetadata(): Promise<Metadata> {
    const c = await getMessages(common);
    const t = await getMessages(collections);
    return {
        title: c.collections.hasret,
        description: t.hasretSubtitle,
        alternates: { canonical: `${SITE_URL}/collection/hasret` },
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
