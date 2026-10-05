"use client";

import { useEffect, useState } from "react";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import productPageMessages from "@/i18n/messages/productPage";
import {
  deliveryTimeline,
  formatDeliveryDate,
  formatDeliveryRange,
  getCountryName,
  type DeliveryTimeline as Timeline,
} from "@/lib/shipping";
import { useVisitorCountry } from "@/lib/use-shipping-country";

// Without a known country the product page shows the dates for the Netherlands
const FALLBACK_COUNTRY = "NL";

export type DeliveryEstimate =
  | { status: "loading" }
  | { status: "unsupported"; country: string }
  | { status: "ready"; country: string; timeline: Timeline };

// Delivery dates for the visitor's country (the cart's choice, otherwise /api/geo), counted from
// today with the same business days as the cart, Stripe and the order page. Worked out after
// mount only, so the server HTML never carries a date from another time zone.
export function useDeliveryEstimate(): DeliveryEstimate {
  const visitor = useVisitorCountry();
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  if (!today || visitor.status === "loading") return { status: "loading" };
  if (visitor.status === "unsupported") return { status: "unsupported", country: visitor.country };
  const country = visitor.status === "supported" ? visitor.country : FALLBACK_COUNTRY;
  const timeline = deliveryTimeline(country, today);
  return timeline ? { status: "ready", country, timeline } : { status: "unsupported", country };
}

// Ordered → made to order → shipped → delivered. Stacked on phones, in a row from 640px.
export function DeliveryTimeline({ estimate }: { estimate: DeliveryEstimate }) {
  const t = useMessages(productPageMessages).delivery;
  const { locale, intlLocale } = useLocale();

  if (estimate.status === "loading") {
    return <div aria-hidden className="min-h-[156px] sm:min-h-[112px]" />;
  }

  if (estimate.status === "unsupported") {
    return (
      <p role="status" className="text-[12px] leading-[1.5] tracking-[0.04em] text-ink">
        {t.cannotShip(getCountryName(estimate.country, locale))}
      </p>
    );
  }

  const { timeline, country } = estimate;
  const steps = [
    { label: t.ordered, value: t.today(formatDeliveryDate(timeline.ordered, intlLocale)), done: true },
    { label: t.production, value: t.productionValue, done: false },
    { label: t.shipped, value: formatDeliveryRange(timeline.shipped.from, timeline.shipped.to, intlLocale), done: false },
    { label: t.delivered, value: formatDeliveryRange(timeline.delivered.from, timeline.delivered.to, intlLocale), done: false },
  ];

  return (
    <section aria-label={t.label} className="border border-line px-4 py-4">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="sub-xs text-ink">{t.label}</h2>
        <p className="sub-xs text-subdued">{t.country(getCountryName(country, locale))}</p>
      </div>
      <ol className="grid grid-cols-1 gap-y-3 sm:grid-cols-4 sm:gap-x-3">
        {steps.map((step, i) => (
          <li key={step.label} className="relative flex gap-3 sm:block">
            {/* Connector to the next step: down on phones, right from 640px */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute bottom-[-14px] left-[4px] top-[13px] w-px bg-line-strong sm:bottom-auto sm:left-[13px] sm:right-[-12px] sm:top-[4px] sm:h-px sm:w-auto"
              />
            )}
            <span
              aria-hidden
              className={
                "relative mt-[3px] block h-[9px] w-[9px] shrink-0 rounded-full border border-ink sm:mt-0 " +
                (step.done ? "bg-ink" : "bg-paper")
              }
            />
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3 sm:mt-2.5 sm:block">
              <p className="sub-xs text-subdued">{step.label}</p>
              <p className="text-right text-[12px] leading-[1.4] tracking-[0.02em] text-ink sm:mt-1 sm:text-left">
                {step.value}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] leading-[1.5] text-subdued">{t.businessDays}</p>
    </section>
  );
}
