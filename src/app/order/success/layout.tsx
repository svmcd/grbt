import type { Metadata } from "next";
import { getMessages } from "@/i18n/server";
import messages from "@/i18n/messages/orderSuccess";

// Private page: never indexed
export async function generateMetadata(): Promise<Metadata> {
    const t = await getMessages(messages);
    return { title: t.title, robots: { index: false, follow: false } };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
