import { redirect } from "next/navigation";

// The old dashboard URL, kept for bookmarks
export default function DashboardRedirect() {
    redirect("/admin");
}
