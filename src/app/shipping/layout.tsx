import type { Metadata } from "next";
import { getMessages, getUrlLocale } from "@/i18n/server";
import messages from "@/i18n/messages/policies";
import { alternatesFor } from "@/lib/seo/locales";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getMessages(messages);
    return {
        title: t.shipping.title,
        alternates: alternatesFor("/shipping", await getUrlLocale()),
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
