"use client";

import { useId, useState } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import sectionMessages from "@/i18n/messages/homeSections";

// Newsletter form. Styled for the dark footer by default; tone="light" for white sections.
export function NewsletterSignup({
  heading,
  tone = "dark",
}: {
  heading?: string;
  tone?: "dark" | "light";
}) {
  const t = useMessages(sectionMessages).newsletter;
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dark = tone === "dark";
  const inputId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      setEmail("");
    }, 1000);
  };

  const strong = dark ? "text-paper" : "text-ink";
  const soft = dark ? "text-night-subdued" : "text-subdued";

  return (
    <div>
      <h2 className={`sub mb-5 ${strong}`}>{heading ?? t.title}</h2>

      {isSubmitted ? (
        <p className={`sub-xs ${strong}`} role="status">
          {t.thanks}
        </p>
      ) : (
        <>
          <p className={`sub-xs mb-6 ${strong}`}>{t.intro}</p>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor={inputId}>
                {t.placeholder}
              </label>
              <input
                id={inputId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                autoComplete="email"
                className="storefront-input sub-xs min-w-0 flex-1 placeholder:text-subdued lg:[&[type]]:!text-[12px]"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className={
                  "btn flex-shrink-0 disabled:opacity-60 " +
                  (dark ? "btn-paper border-paper hover:border-paper" : "btn-ink")
                }
              >
                {isLoading ? "..." : t.subscribe}
              </button>
            </div>
            <p className={`sub-xs mt-4 ${soft}`}>{t.privacy}</p>
          </form>
        </>
      )}
    </div>
  );
}
