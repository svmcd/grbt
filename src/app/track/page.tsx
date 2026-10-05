"use client";

import { useState } from "react";
import Link from "@/i18n/LocaleLink";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import trackMessages from "@/i18n/messages/trackPage";
import commonMessages from "@/i18n/messages/common";
import { TextPage } from "@/app/components/pages/TextPage";

// Response of POST /api/track
type TrackResult = {
  number: string;
  status: "paid" | "label_created" | "shipped" | "completed" | "refunded";
  orderedAt: string | null;
  shippedAt: string | null;
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
  items: { title: string; type: "tshirt" | "hoodie" | "sweater" | null; quantity: number }[];
};

type ErrorKey = "notFound" | "invalidNumber" | "rateLimited" | "error";

export default function TrackPage() {
  const t = useMessages(trackMessages);
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const number = order.replace(/[\s#]/g, "").toUpperCase();
    setResult(null);
    if (!/^[A-Z0-9_]{8}$/.test(number)) {
      setError("invalidNumber");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: number, email }),
      });
      if (res.ok) setResult(await res.json());
      else setError(res.status === 404 ? "notFound" : res.status === 429 ? "rateLimited" : "error");
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "storefront-input placeholder:text-subdued focus:outline-none disabled:opacity-60";

  return (
    <TextPage title={t.title} intro={<p>{t.intro}</p>}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">{t.orderLabel}</span>
            <input
              className={`${fieldClass} uppercase placeholder:normal-case`}
              placeholder={t.orderPlaceholder}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={12}
              required
              disabled={loading}
            />
          </label>
          <label className="block">
            <span className="sr-only">{t.emailLabel}</span>
            <input
              type="email"
              className={fieldClass}
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={254}
              required
              disabled={loading}
            />
          </label>
        </div>
        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-ink w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
          >
            {loading ? t.searching : t.submit}
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-8 border border-sale px-4 py-3 text-[14px] leading-[1.5] text-sale">
            {t[error]}
          </p>
        )}

        {result && <OrderStatus result={result} />}
      </div>

      {result && (
        <p className="mt-10 text-[14px] leading-[1.7] text-ink">
          {t.contact}{" "}
          <Link href="/contact" className="underline underline-offset-4">
            {t.contactLink}
          </Link>
        </p>
      )}
    </TextPage>
  );
}

// Status line, timeline, tracking and items of one order. The timeline is Ordered, Preparing,
// Shipped; a completed order ends on Completed instead of Shipped, a refunded one on Refunded.
function OrderStatus({ result }: { result: TrackResult }) {
  const t = useMessages(trackMessages);
  const common = useMessages(commonMessages);
  const { intlLocale } = useLocale();
  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(intlLocale, { day: "numeric", month: "long", year: "numeric" }) : null;
  const ordered = { label: t.steps.ordered, date: formatDate(result.orderedAt), done: true, current: false };
  const finished = result.status === "shipped" || result.status === "completed";
  const steps =
    result.status === "refunded"
      ? [ordered, { label: t.steps.refunded, date: null, done: true, current: false }]
      : [
          ordered,
          { label: t.steps.preparing, date: null, done: finished, current: !finished },
          result.status === "completed"
            ? { label: t.steps.completed, date: null, done: true, current: false }
            : { label: t.steps.shipped, date: formatDate(result.shippedAt), done: finished, current: false },
        ];
  // "The tracking code appears here once shipped" only makes sense for an order still on its way
  const showTracking = Boolean(result.trackingCode) || result.status === "paid" || result.status === "label_created";

  return (
    <section className="mt-10 border-t border-line pt-8">
      <p className="sub-xs text-subdued">{t.orderNumber(result.number)}</p>
      <h2 className="sub mt-2 text-ink">{t.status[result.status]}</h2>

      {/* Timeline */}
      <ol className={"mt-8 grid " + (steps.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {steps.map((step, i) => {
          const reached = step.done || step.current;
          return (
            <li key={step.label} className="relative pr-2" aria-current={step.current ? "step" : undefined}>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={
                    "absolute top-[5px] right-0 left-[11px] h-px " + (steps[i + 1].done || steps[i + 1].current ? "bg-ink" : "bg-line-strong")
                  }
                />
              )}
              <span
                aria-hidden
                className={
                  "relative block h-[11px] w-[11px] rounded-full border " +
                  (step.done ? "border-ink bg-ink" : step.current ? "border-ink bg-paper" : "border-line-strong bg-paper")
                }
              />
              <p className={"sub-xs mt-3 " + (reached ? "text-ink" : "text-subdued")}>{step.label}</p>
              {step.date && <p className="mt-1 text-[12px] leading-[1.4] text-subdued">{step.date}</p>}
            </li>
          );
        })}
      </ol>

      {/* Carrier and tracking */}
      {showTracking && (
        <div className="mt-10 border-t border-line pt-6">
          {result.trackingCode ? (
            <>
              <dl className="text-[14px] leading-[1.7]">
                {result.carrier && (
                  <div className="flex justify-between gap-4 border-b border-line py-2">
                    <dt className="sub-xs text-subdued">{t.carrier}</dt>
                    <dd className="text-right text-ink">{result.carrier}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-b border-line py-2">
                  <dt className="sub-xs text-subdued">{t.trackingCode}</dt>
                  <dd className="text-right break-all text-ink">{result.trackingCode}</dd>
                </div>
              </dl>
              {result.trackingUrl && (
                <a
                  href={result.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-ink mt-6 w-full sm:w-auto"
                >
                  {result.carrier ? t.trackParcel(result.carrier) : t.trackParcelGeneric}
                </a>
              )}
            </>
          ) : (
            <p className="text-[14px] leading-[1.7] text-ink">{t.noTrackingYet}</p>
          )}
        </div>
      )}

      {/* Items */}
      {result.items.length > 0 && (
        <div className="mt-10">
          <h3 className="sub-xs mb-3 text-subdued">{t.items}</h3>
          <ul className="border-t border-line">
            {result.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4 border-b border-line py-3 text-[14px] text-ink">
                <span className="min-w-0 break-words">
                  {item.title}
                  {item.type && ` ${common.productTypes[item.type]}`}
                </span>
                <span className="shrink-0">× {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
