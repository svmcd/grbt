"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { FulfillmentStatus, PaymentStatus } from "@/lib/admin/orders";

export function cx(...c: (string | false | null | undefined)[]) {
    return c.filter(Boolean).join(" ");
}

/* ---------- Layout ---------- */

export function Card({ children, className, title, action }: { children: React.ReactNode; className?: string; title?: React.ReactNode; action?: React.ReactNode }) {
    return (
        <section className={cx("rounded-xl border border-zinc-200 bg-paper shadow-[0_1px_0_rgba(0,0,0,0.04)]", className)}>
            {(title || action) && (
                <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
                    {title && <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cx("px-4 py-4 sm:px-5", className)}>{children}</div>;
}

export function PageHeader({
    title,
    back,
    meta,
    actions,
}: {
    title: React.ReactNode;
    back?: { href: string; label: string };
    meta?: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                {back && (
                    <Link href={back.href} className="mb-1 inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900">
                        <ChevronLeft className="h-4 w-4" />
                        {back.label}
                    </Link>
                )}
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h1>
                    {meta}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-zinc-900">{title}</p>
            {children && <div className="mt-1 text-sm text-zinc-600">{children}</div>}
        </div>
    );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg className={cx("animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-600">
            <Spinner />
            {label}
        </div>
    );
}

/* ---------- Badges ---------- */

type Tone = "green" | "amber" | "red" | "blue" | "yellow" | "gray" | "purple";
const TONES: Record<Tone, string> = {
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-800",
    blue: "bg-sky-100 text-sky-800",
    yellow: "bg-yellow-100 text-yellow-900",
    gray: "bg-zinc-200 text-zinc-800",
    purple: "bg-violet-100 text-violet-800",
};
const DOTS: Record<Tone, string> = {
    green: "bg-emerald-600",
    amber: "bg-amber-500",
    red: "bg-red-600",
    blue: "bg-sky-600",
    yellow: "bg-yellow-500",
    gray: "bg-zinc-500",
    purple: "bg-violet-600",
};

export function Badge({ tone = "gray", children, dot = false }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
    return (
        <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", TONES[tone])}>
            {dot && <span className={cx("h-1.5 w-1.5 rounded-full", DOTS[tone])} />}
            {children}
        </span>
    );
}

const PAYMENT: Record<PaymentStatus, { label: string; tone: Tone }> = {
    paid: { label: "Paid", tone: "green" },
    partially_refunded: { label: "Partially refunded", tone: "amber" },
    refunded: { label: "Refunded", tone: "red" },
    unpaid: { label: "Unpaid", tone: "gray" },
};
const FULFILLMENT: Record<FulfillmentStatus, { label: string; tone: Tone }> = {
    unfulfilled: { label: "Unfulfilled", tone: "yellow" },
    label_created: { label: "Label created", tone: "blue" },
    shipped: { label: "Shipped", tone: "green" },
};

export const PaymentBadge = ({ status }: { status: PaymentStatus }) => (
    <Badge tone={PAYMENT[status].tone} dot>
        {PAYMENT[status].label}
    </Badge>
);
export const FulfillmentBadge = ({ status }: { status: FulfillmentStatus }) => (
    <Badge tone={FULFILLMENT[status].tone} dot>
        {FULFILLMENT[status].label}
    </Badge>
);
export const paymentLabel = (s: PaymentStatus) => PAYMENT[s].label;
export const fulfillmentLabel = (s: FulfillmentStatus) => FULFILLMENT[s].label;

/* ---------- Controls ---------- */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "dangerGhost";
const BUTTONS: Record<ButtonVariant, string> = {
    primary: "bg-zinc-900 text-paper hover:bg-zinc-700 border border-zinc-900",
    secondary: "bg-paper text-zinc-900 border border-zinc-300 hover:bg-zinc-50 shadow-[0_1px_0_rgba(0,0,0,0.05)]",
    danger: "bg-red-600 text-paper border border-red-600 hover:bg-red-700",
    ghost: "bg-transparent text-zinc-800 border border-transparent hover:bg-zinc-100",
    dangerGhost: "bg-transparent text-red-700 border border-transparent hover:bg-red-50",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: "sm" | "md" = "md") {
    return cx(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm",
        BUTTONS[variant],
    );
}

export function Button({
    variant = "secondary",
    size = "md",
    loading,
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md"; loading?: boolean }) {
    return (
        <button type="button" {...props} disabled={props.disabled || loading} className={cx(buttonClass(variant, size), className)}>
            {loading && <Spinner className="h-3.5 w-3.5" />}
            {children}
        </button>
    );
}

export const inputClass =
    "h-9 w-full rounded-lg border border-zinc-300 bg-paper px-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
export const selectClass = cx(inputClass, "pr-8");
export const textareaClass =
    "w-full rounded-lg border border-zinc-300 bg-paper px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
    return (
        <label className={cx("block", className)}>
            <span className="mb-1 block text-[13px] font-medium text-zinc-800">{label}</span>
            {children}
            {hint && <span className="mt-1 block text-xs text-zinc-600">{hint}</span>}
        </label>
    );
}

export function Tabs<T extends string>({
    tabs,
    value,
    onChange,
}: {
    tabs: { key: T; label: string; count?: number }[];
    value: T;
    onChange: (key: T) => void;
}) {
    return (
        <div className="-mx-1 flex max-w-[calc(100%+0.5rem)] gap-1 overflow-x-auto px-1 pb-px [scrollbar-width:none]" role="tablist">
            {tabs.map((t) => {
                const active = t.key === value;
                return (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(t.key)}
                        className={cx(
                            "inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors",
                            active ? "bg-zinc-900 text-paper" : "text-zinc-700 hover:bg-zinc-200/70",
                        )}
                    >
                        {t.label}
                        {t.count !== undefined && (
                            <span className={cx("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-paper/20 text-paper" : "bg-zinc-200 text-zinc-800")}>
                                {t.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

/* ---------- Dialog ---------- */

export function Dialog({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-900/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="w-full max-w-md rounded-t-2xl bg-paper shadow-xl sm:rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-zinc-200 px-5 py-4">
                    <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
                </div>
                <div className="px-5 py-4 text-sm text-zinc-800">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-3">{footer}</div>}
            </div>
        </div>
    );
}

/* ---------- Icons (inline, 20px grid) ---------- */

type IconProps = { className?: string };
const icon = (path: React.ReactNode) =>
    function Icon({ className = "h-5 w-5" }: IconProps) {
        return (
            <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {path}
            </svg>
        );
    };

export const HomeIcon = icon(<path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1V9.5Z" />);
export const OrdersIcon = icon(
    <>
        <path d="M4 4h12l-1 12H5L4 4Z" />
        <path d="M7.5 7.5a2.5 2.5 0 0 0 5 0" />
    </>,
);
export const CustomersIcon = icon(
    <>
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5" />
    </>,
);
export const AnalyticsIcon = icon(<path d="M4 16V9m4 7V4m4 12v-5m4 5V7" />);
export const StarIcon = icon(<path d="m10 3 2.1 4.4 4.8.6-3.5 3.3.9 4.7L10 13.7 5.7 16l.9-4.7L3.1 8l4.8-.6L10 3Z" />);
export const TrafficIcon = icon(<path d="M3 14.5 7.5 10l3 3L17 6.5M12.5 6.5H17V11" />);
export const CartIcon = icon(
    <>
        <path d="M3 4h2l1.6 8.2a1 1 0 0 0 1 .8h6.8a1 1 0 0 0 1-.8L17 7H6" />
        <circle cx="8.5" cy="16" r="1" />
        <circle cx="14" cy="16" r="1" />
    </>,
);
export const MailIcon = icon(
    <>
        <rect x="3" y="5" width="14" height="10" rx="1.5" />
        <path d="m3.5 6 6.5 5 6.5-5" />
    </>,
);
export const SearchIcon = icon(
    <>
        <circle cx="9" cy="9" r="5" />
        <path d="m13 13 4 4" />
    </>,
);
export const SyncIcon = icon(
    <>
        <path d="M16 10a6 6 0 0 1-10.4 4.1M4 10a6 6 0 0 1 10.4-4.1" />
        <path d="M14.5 2.5v3.6h-3.6M5.5 17.5v-3.6h3.6" />
    </>,
);
export const MenuIcon = icon(<path d="M3.5 6h13M3.5 10h13M3.5 14h13" />);
export const CloseIcon = icon(<path d="m5 5 10 10M15 5 5 15" />);
export const ChevronLeft = icon(<path d="m12 5-5 5 5 5" />);
export const ChevronRight = icon(<path d="m8 5 5 5-5 5" />);
export const PlusIcon = icon(<path d="M10 4v12M4 10h12" />);
export const DownloadIcon = icon(<path d="M10 3.5v9m0 0-3.5-3.5M10 12.5l3.5-3.5M4 15.5h12" />);
export const PrintIcon = icon(
    <>
        <path d="M6 7V3.5h8V7" />
        <rect x="3" y="7" width="14" height="7" rx="1.5" />
        <path d="M6 12h8v4.5H6z" />
    </>,
);
export const NoteIcon = icon(<path d="M5 3.5h7l3 3V16a.5.5 0 0 1-.5.5h-9.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5ZM7.5 9.5h5M7.5 12.5h5" />);
export const FlagIcon = icon(<path d="M5 17V3.5m0 0h9l-2 3.5 2 3.5H5" />);
export const ExternalIcon = icon(<path d="M11 4h5v5m0-5-7 7M14 12v3.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5H8" />);
export const CopyIcon = icon(
    <>
        <rect x="7" y="7" width="9.5" height="9.5" rx="1.5" />
        <path d="M13 7V4.5a1 1 0 0 0-1-1H4.5a1 1 0 0 0-1 1V12a1 1 0 0 0 1 1H7" />
    </>,
);
export const GiftIcon = icon(
    <>
        <rect x="3.5" y="8" width="13" height="8.5" rx="1" />
        <path d="M3 5.5h14V8H3zM10 5.5v11M10 5.5C8.5 2.5 5.5 3 6.5 5.5M10 5.5c1.5-3 4.5-2.5 3.5 0" />
    </>,
);
export const PenIcon = icon(<path d="m4 16 1-4 8-8 3 3-8 8-4 1ZM11.5 5.5l3 3" />);
export const ArrowUpIcon = icon(<path d="M10 15V5m0 0-4 4m4-4 4 4" />);
export const ArrowDownIcon = icon(<path d="M10 5v10m0 0-4-4m4 4 4-4" />);
