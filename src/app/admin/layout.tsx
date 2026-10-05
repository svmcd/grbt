import type { Metadata } from "next";
import { AdminShell } from "./_components/AdminShell";

export const metadata: Metadata = {
    title: { absolute: "eğrikuyu admin" },
    robots: { index: false, follow: false },
};

// The back office. The shop header, footer and cart are hidden on /admin (see StoreChrome).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminShell>{children}</AdminShell>;
}
