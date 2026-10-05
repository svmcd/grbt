"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import reviewMessages from "@/i18n/messages/reviews";

type Product = { slug: string; title: string; image: string };
type Request = { name: string; locale: string; submitted: boolean; products: Product[] };

function Stars({ value, onChange, label, starLabel }: { value: number; onChange: (n: number) => void; label: string; starLabel: (n: number) => string }) {
    return (
        <div role="radiogroup" aria-label={label} className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={starLabel(n)}
                    onClick={() => onChange(n)}
                    className="p-1 text-[28px] leading-none"
                >
                    <span className={n <= value ? "text-ink" : "text-line-strong"}>★</span>
                </button>
            ))}
        </div>
    );
}

export default function ReviewPage() {
    const { token } = useParams<{ token: string }>();
    const searchParams = useSearchParams();
    const { locale, setLocale } = useLocale();
    const t = useMessages(reviewMessages).page;

    const [request, setRequest] = useState<Request | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "notfound" | "sending" | "done">("loading");
    const [name, setName] = useState("");
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [texts, setTexts] = useState<Record<string, string>>({});
    const [error, setError] = useState("");

    // The email link carries the customer's language
    useEffect(() => {
        const lang = searchParams.get("lang");
        if (isLocale(lang) && lang !== locale) setLocale(lang);
    }, [searchParams, locale, setLocale]);

    useEffect(() => {
        fetch(`/api/reviews?token=${encodeURIComponent(token)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data: Request) => {
                setRequest(data);
                setName(data.name);
                setStatus(data.submitted ? "done" : "ready");
            })
            .catch(() => setStatus("notfound"));
    }, [token]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const reviews = (request?.products || [])
            .filter((p) => ratings[p.slug])
            .map((p) => ({ slug: p.slug, rating: ratings[p.slug], text: texts[p.slug] || "" }));
        if (!reviews.length) {
            setError(t.needRating);
            return;
        }
        setError("");
        setStatus("sending");
        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, name, reviews }),
        }).catch(() => null);
        if (res?.ok) setStatus("done");
        else {
            setStatus("ready");
            setError(t.error);
        }
    };

    return (
        <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-8 lg:py-20">
            {status === "loading" && <p className="sub text-subdued">…</p>}
            {status === "notfound" && <p className="sub">{t.notFound}</p>}
            {status === "done" && (
                <div>
                    <h1 className="h-section mb-4">{request?.submitted ? t.alreadyTitle : t.thanksTitle}</h1>
                    <p className="text-[15px] leading-relaxed">{request?.submitted ? t.alreadyText : t.thanksText}</p>
                </div>
            )}
            {(status === "ready" || status === "sending") && request && (
                <form onSubmit={submit}>
                    <h1 className="h-section mb-4">{t.title}</h1>
                    <p className="mb-10 text-[15px] leading-relaxed">{t.intro}</p>

                    <div className="flex flex-col gap-8">
                        {request.products.map((p) => (
                            <div key={p.slug} className="flex flex-col gap-4 border border-line p-4 sm:flex-row sm:p-6">
                                <div className="relative h-28 w-28 flex-shrink-0 self-start border border-line bg-paper">
                                    <Image src={p.image} alt={p.title} fill sizes="112px" className="object-contain" />
                                </div>
                                <div className="flex flex-1 flex-col gap-3">
                                    <p className="sub">{p.title}</p>
                                    <Stars
                                        value={ratings[p.slug] || 0}
                                        onChange={(n) => setRatings((r) => ({ ...r, [p.slug]: n }))}
                                        label={t.ratingLabel(p.title)}
                                        starLabel={t.stars}
                                    />
                                    <textarea
                                        value={texts[p.slug] || ""}
                                        onChange={(e) => setTexts((x) => ({ ...x, [p.slug]: e.target.value }))}
                                        placeholder={t.textPlaceholder}
                                        maxLength={1500}
                                        rows={3}
                                        className="storefront-input min-h-[96px] resize-y text-[15px]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <label className="mt-8 block">
                        <span className="sub-xs mb-2 block">{t.yourName}</span>
                        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="storefront-input" />
                    </label>

                    {error && (
                        <p role="alert" className="sub-xs mt-4 text-sale">
                            {error}
                        </p>
                    )}
                    <button type="submit" disabled={status === "sending"} className="btn btn-ink mt-6 w-full sm:w-auto">
                        {status === "sending" ? t.sending : t.submit}
                    </button>
                </form>
            )}
        </div>
    );
}
