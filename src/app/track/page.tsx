"use client";

import { useState } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import trackMessages from "@/i18n/messages/trackPage";
import { TextPage } from "@/app/components/pages/TextPage";

export default function TrackPage() {
  const t = useMessages(trackMessages);
  const [order, setOrder] = useState("");
  // Submitted order number; the message is rendered in the current language
  const [result, setResult] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(order);
  };

  return (
    <TextPage title={t.title}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="track-order" className="sr-only">
          {t.placeholder}
        </label>
        <input
          id="track-order"
          className="storefront-input flex-1 placeholder:text-subdued focus:outline-none"
          placeholder={t.placeholder}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          required
        />
        <button className="btn btn-ink shrink-0" type="submit">
          {t.submit}
        </button>
      </form>
      {result && (
        <p className="mt-6 border-t border-line pt-6 text-[14px] leading-[1.7] text-ink" aria-live="polite">
          {t.result(result)}
        </p>
      )}
    </TextPage>
  );
}
