"use client";

import { useEffect, useState } from "react";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import reviewMessages from "@/i18n/messages/reviews";

type Data = { count: number; average: number; reviews: { name: string; rating: number; text: string; createdAt: string }[] };

const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
    <span aria-hidden className="tracking-[2px]" style={{ fontSize: size }}>
        {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= Math.round(value) ? "text-ink" : "text-line-strong"}>
                ★
            </span>
        ))}
    </span>
);

// Approved, verified reviews. Renders nothing until a product has at least one.
export function ProductReviews({ slug }: { slug: string }) {
    const t = useMessages(reviewMessages).section;
    const { intlLocale } = useLocale();
    const [data, setData] = useState<Data | null>(null);

    useEffect(() => {
        fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then(setData)
            .catch(() => setData(null));
    }, [slug]);

    if (!data || data.count === 0) return null;

    return (
        <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8 lg:px-12" aria-labelledby="reviews-title">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
                <h2 id="reviews-title" className="h-section">
                    {t.title}
                </h2>
                <div className="flex items-center gap-3">
                    <Stars value={data.average} size={20} />
                    <span className="sub">{data.average.toFixed(1)}</span>
                    <span className="sub-xs text-subdued">{t.basedOn(data.count)}</span>
                </div>
            </div>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.reviews.map((r, i) => (
                    <li key={i} className="flex flex-col gap-3 border border-line p-6">
                        <Stars value={r.rating} />
                        {r.text && <p className="text-[15px] leading-relaxed">{r.text}</p>}
                        <p className="sub-xs mt-auto text-subdued">
                            {r.name} · {t.verified} · {new Date(r.createdAt).toLocaleDateString(intlLocale, { month: "long", year: "numeric" })}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
