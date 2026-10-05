import type { Metadata } from "next";
import { getMessages, getUrlLocale } from "@/i18n/server";
import common from "@/i18n/messages/common";
import collections from "@/i18n/messages/collections";
import { alternatesFor } from "@/lib/seo/locales";

export async function generateMetadata(): Promise<Metadata> {
    const c = await getMessages(common);
    const t = await getMessages(collections);
    return {
        title: c.collections.memleket,
        description: t.memleketSubtitle,
        alternates: alternatesFor("/collection/memleket", await getUrlLocale()),
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
