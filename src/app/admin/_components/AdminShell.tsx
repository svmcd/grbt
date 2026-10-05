"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEV_BYPASS } from "@/lib/admin/client";
import { timeAgo } from "@/lib/admin/format";
import { isToShip } from "@/lib/admin/metrics";
import { AdminProvider, useAdmin } from "./AdminProvider";
import { LoginForm } from "./LoginForm";
import {
    AnalyticsIcon,
    Button,
    CartIcon,
    CloseIcon,
    CustomersIcon,
    HomeIcon,
    LoadingBlock,
    MailIcon,
    MenuIcon,
    OrdersIcon,
    SearchIcon,
    Spinner,
    StarIcon,
    SyncIcon,
    TrafficIcon,
    cx,
} from "./ui";

export function AdminShell({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <div className="admin-ui">
                <Gate>{children}</Gate>
            </div>
        </AdminProvider>
    );
}

function Gate({ children }: { children: React.ReactNode }) {
    const { access, email, signOut } = useAdmin();
    const pathname = usePathname();

    if (access === "loading") {
        return (
            <div className="min-h-screen bg-zinc-100">
                <LoadingBlock label="Loading admin" />
            </div>
        );
    }
    if (access === "signed_out") return <LoginForm />;
    if (access === "no_access") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
                <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-paper p-6 text-center shadow-sm">
                    <h1 className="text-lg font-semibold text-zinc-900">This account has no admin access</h1>
                    <p className="mt-2 text-sm text-zinc-700">
                        You are signed in as <span className="font-medium">{email}</span>. Sign out and use an admin account.
                    </p>
                    <Button variant="primary" className="mt-5 w-full" onClick={signOut}>
                        Sign out
                    </Button>
                </div>
            </div>
        );
    }
    // Packing slips print without the admin chrome
    if (pathname?.endsWith("/slip")) return <>{children}</>;
    return <Frame>{children}</Frame>;
}

const NAV = [
    { href: "/admin", label: "Home", icon: HomeIcon },
    { href: "/admin/orders", label: "Orders", icon: OrdersIcon, badge: "toShip" },
    { href: "/admin/customers", label: "Customers", icon: CustomersIcon },
    { href: "/admin/reviews", label: "Reviews", icon: StarIcon, badge: "reviews" },
    { href: "/admin/analytics", label: "Analytics", icon: AnalyticsIcon },
    { href: "/admin/traffic", label: "Traffic", icon: TrafficIcon },
    { href: "/admin/abandoned", label: "Abandoned checkouts", icon: CartIcon },
    { href: "/admin/subscribers", label: "Subscribers", icon: MailIcon },
];

function Frame({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "/admin";
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => setMenuOpen(false), [pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-900">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-zinc-200 bg-zinc-50 lg:flex">
                <Sidebar pathname={pathname} />
            </aside>

            {/* Mobile slide-out */}
            <div className={cx("fixed inset-0 z-50 lg:hidden", menuOpen ? "" : "pointer-events-none")} aria-hidden={!menuOpen}>
                <div className={cx("absolute inset-0 bg-zinc-900/40 transition-opacity", menuOpen ? "opacity-100" : "opacity-0")} onClick={() => setMenuOpen(false)} />
                <aside
                    className={cx(
                        "absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-zinc-50 shadow-xl transition-transform duration-200",
                        menuOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                >
                    <button onClick={() => setMenuOpen(false)} className="absolute right-2 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-200" aria-label="Close menu">
                        <CloseIcon />
                    </button>
                    <Sidebar pathname={pathname} mobile />
                </aside>
            </div>

            <div className="lg:pl-60">
                <TopBar onMenu={() => setMenuOpen(true)} />
                <main className="mx-auto w-full max-w-[1200px] px-3 pb-24 pt-4 sm:px-6 sm:pt-6">{children}</main>
            </div>
        </div>
    );
}

function Sidebar({ pathname, mobile = false }: { pathname: string; mobile?: boolean }) {
    const { orders, email, signOut, reviews } = useAdmin();
    const counts: Record<string, number> = {
        toShip: orders.filter(isToShip).length,
        reviews: reviews.reviews.filter((r) => r.status === "pending").length,
    };
    const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

    return (
        <>
            <Link href="/admin" className="flex h-14 flex-shrink-0 items-center gap-2 px-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/egrikuyu.svg" alt="eğrikuyu" className="h-[22px] w-auto" />
                <span className="text-sm font-medium text-zinc-700">admin</span>
            </Link>
            {mobile && <MobileSearch />}
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
                {NAV.map(({ href, label, icon: Icon, badge }) => (
                    <Link
                        key={href}
                        href={href}
                        aria-current={isActive(href) ? "page" : undefined}
                        className={cx(
                            "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors",
                            isActive(href) ? "bg-paper text-zinc-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" : "text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900",
                        )}
                    >
                        <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                        <span className="flex-1 truncate">{label}</span>
                        {badge && counts[badge] > 0 && (
                            <span
                                className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-amber-950"
                                title={badge === "toShip" ? "Orders to ship" : "Reviews waiting for approval"}
                            >
                                {counts[badge]}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
            <div className="border-t border-zinc-200 px-4 py-3">
                <p className="truncate text-[13px] text-zinc-700" title={email}>
                    {email}
                    {DEV_BYPASS && <span className="ml-1 text-amber-700">(dev)</span>}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[13px]">
                    <a href="/" target="_blank" rel="noreferrer" className="font-medium text-zinc-700 hover:text-zinc-900">
                        View shop
                    </a>
                    <button onClick={signOut} className="font-medium text-zinc-700 hover:text-zinc-900">
                        Sign out
                    </button>
                </div>
            </div>
        </>
    );
}

function SearchForm({ className, placeholder = "Search orders: number, name, email, city" }: { className?: string; placeholder?: string }) {
    const router = useRouter();
    const [q, setQ] = useState("");
    return (
        <form
            role="search"
            className={cx("relative", className)}
            onSubmit={(e) => {
                e.preventDefault();
                router.push(`/admin/orders?q=${encodeURIComponent(q.trim())}`);
                setQ("");
            }}
        >
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:bg-paper"
            />
        </form>
    );
}

function MobileSearch() {
    return <SearchForm className="mx-3 mb-2" placeholder="Search orders" />;
}

function SyncButton({ compact = false }: { compact?: boolean }) {
    const { lastSync, syncing, sync } = useAdmin();
    const [, tick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => tick((n) => n + 1), 30000);
        return () => clearInterval(t);
    }, []);
    const label = syncing ? "Syncing…" : lastSync ? `Synced ${timeAgo(lastSync)}` : "Not synced yet";
    return (
        <button
            onClick={sync}
            disabled={syncing}
            title="Pull refunds and payment details from Stripe"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 bg-paper px-3 text-[13px] font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-70"
        >
            {syncing ? <Spinner className="h-4 w-4" /> : <SyncIcon className="h-4 w-4" />}
            {compact ? <span>{label}</span> : (
                <span>
                    <span className="hidden xl:inline">Sync with Stripe · </span>
                    <span className="text-zinc-600">{label}</span>
                </span>
            )}
        </button>
    );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
    const { email, signOut } = useAdmin();
    return (
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-paper/95 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-3 sm:px-6">
                <button onClick={onMenu} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-800 hover:bg-zinc-100 lg:hidden" aria-label="Open menu">
                    <MenuIcon />
                </button>
                <Link href="/admin" className="flex items-center gap-1.5 lg:hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/egrikuyu.svg" alt="eğrikuyu" className="h-[18px] w-auto" />
                    <span className="text-[13px] font-medium text-zinc-700">admin</span>
                </Link>
                <SearchForm className="hidden max-w-md flex-1 lg:block" />
                <div className="ml-auto flex items-center gap-2">
                    <div className="hidden sm:block">
                        <SyncButton />
                    </div>
                    <div className="sm:hidden">
                        <SyncButton compact />
                    </div>
                    <div className="hidden items-center gap-3 border-l border-zinc-200 pl-3 lg:flex">
                        <span className="max-w-[200px] truncate text-[13px] text-zinc-700" title={email}>
                            {email}
                        </span>
                        <button onClick={signOut} className="text-[13px] font-medium text-zinc-800 hover:text-zinc-950">
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
