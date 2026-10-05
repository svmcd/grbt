import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { AdminShell } from "./_components/AdminShell";

export const metadata: Metadata = {
    title: { absolute: "eğrikuyu admin" },
    robots: { index: false, follow: false },
};

// The back office. The shop header, footer and cart are hidden on /admin (see StoreChrome).
// Firebase sign-in state is only needed here, so the AuthProvider lives in this layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminShell>{children}</AdminShell>
        </AuthProvider>
    );
}
