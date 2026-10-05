"use client";

import { useEffect, useRef, useState } from "react";
import { money, moneyShort } from "@/lib/admin/format";
import type { Bucket } from "@/lib/admin/metrics";

const HEIGHT = 240;
const PAD = { top: 12, right: 8, bottom: 26, left: 48 };

function niceStep(max: number, ticks = 4) {
    const raw = max / ticks;
    const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const n = raw / pow;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

// Single-series bar chart (net sales per bucket) with axis labels and hover/tap tooltips
// Defaults show money (net sales); pass formatters for other measures (e.g. visitors)
export function BarChart({
    buckets,
    emptyLabel = "No sales in this period",
    formatAxis = moneyShort,
    formatTooltip = (b: Bucket) => `${money(b.value)} · ${b.orders} order${b.orders === 1 ? "" : "s"}`,
    ariaLabel = "Net sales chart",
}: {
    buckets: Bucket[];
    emptyLabel?: string;
    formatAxis?: (v: number) => string;
    formatTooltip?: (b: Bucket) => string;
    ariaLabel?: string;
}) {
    const wrap = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [active, setActive] = useState<number | null>(null);

    useEffect(() => {
        const el = wrap.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const max = Math.max(0, ...buckets.map((b) => b.value));
    const step = Math.max(formatAxis === moneyShort ? 100 : 1, niceStep(max || (formatAxis === moneyShort ? 10000 : 10))); // whole euros / whole counts
    const top = Math.max(step, Math.ceil(max / step) * step);
    const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

    const plotW = Math.max(0, width - PAD.left - PAD.right);
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const slot = buckets.length ? plotW / buckets.length : 0;
    const gap = Math.min(8, Math.max(2, slot * 0.25));
    const barW = Math.max(1, slot - gap);
    const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
    const labelEvery = Math.max(1, Math.ceil(buckets.length / Math.max(1, Math.floor(plotW / 54))));
    const allZero = max === 0;
    const a = active !== null ? buckets[active] : null;

    return (
        <div ref={wrap} className="relative w-full select-none" onMouseLeave={() => setActive(null)}>
            {width > 0 && (
                <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel}>
                    {ticks.map((t) => (
                        <g key={t}>
                            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#a1a1aa" : "#e4e4e7"} strokeWidth={1} />
                            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#52525b" className="tabular-nums">
                                {formatAxis(t)}
                            </text>
                        </g>
                    ))}
                    {buckets.map((b, i) => {
                        const x = PAD.left + i * slot + gap / 2;
                        const h = Math.max(0, y(0) - y(b.value));
                        const r = Math.min(4, barW / 2, h);
                        return (
                            <g key={b.key}>
                                {h > 0 && (
                                    <path
                                        d={`M${x},${y(0)} v${-(h - r)} q0,${-r} ${r},${-r} h${barW - 2 * r} q${r},0 ${r},${r} v${h - r} z`}
                                        fill={active === i ? "#18181b" : "#3f3f46"}
                                    />
                                )}
                                {i % labelEvery === 0 && (
                                    <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" fontSize="11" fill="#52525b">
                                        {b.label}
                                    </text>
                                )}
                                {/* hit target: full column height */}
                                <rect
                                    x={PAD.left + i * slot}
                                    y={PAD.top}
                                    width={slot}
                                    height={plotH}
                                    fill={active === i ? "rgba(0,0,0,0.04)" : "transparent"}
                                    onMouseEnter={() => setActive(i)}
                                    onClick={() => setActive(active === i ? null : i)}
                                />
                            </g>
                        );
                    })}
                </svg>
            )}
            {allZero && width > 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-[40%] text-center text-sm text-zinc-600" style={{ paddingLeft: PAD.left }}>
                    {emptyLabel}
                </div>
            )}
            {a && active !== null && (
                <div
                    className="pointer-events-none absolute z-10 w-max max-w-[220px] rounded-lg border border-zinc-200 bg-paper px-3 py-2 text-xs shadow-lg"
                    style={{
                        left: Math.min(Math.max(PAD.left + active * slot + slot / 2, 90), width - 90),
                        top: Math.max(0, y(a.value) - 64),
                        transform: "translateX(-50%)",
                    }}
                >
                    <p className="font-medium text-zinc-900">{a.longLabel}</p>
                    <p className="mt-0.5 tabular-nums text-zinc-800">{formatTooltip(a)}</p>
                </div>
            )}
        </div>
    );
}
