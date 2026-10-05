import type { Metadata } from "next";
import { getMessages, getUrlLocale } from "@/i18n/server";
import collections from "@/i18n/messages/collections";
import { alternatesFor } from "@/lib/seo/locales";

// /collection (all collections). The collection pages below set their own title and links.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getMessages(collections);
    return {
        // Absolute so the collection pages below keep the site-wide "%s | eğrikuyu" template
        title: { absolute: `${t.indexTitle} | eğrikuyu`, template: "%s | eğrikuyu" },
        alternates: alternatesFor("/collection", await getUrlLocale()),
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
