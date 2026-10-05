"use client";

import { useState } from "react";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import contactMessages from "@/i18n/messages/contactPage";
import commonMessages from "@/i18n/messages/common";
import { TextPage } from "@/app/components/pages/TextPage";

// Same limits as /api/contact
const MAX_NAME = 100;
const MAX_MESSAGE = 3000;

export default function ContactPage() {
  const { locale } = useLocale();
  const t = useMessages(contactMessages);
  const common = useMessages(commonMessages);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot: hidden from people, bots tend to fill it in
  const [website, setWebsite] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message, website, locale }),
      });

      if (response.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        const { error: code } = await response.json().catch(() => ({ error: "" }));
        setError(
          code === "invalid_email"
            ? t.invalidEmail
            : code === "too_long"
              ? t.tooLong(MAX_MESSAGE)
              : response.status === 429
                ? t.rateLimited
                : t.sendFailed
        );
      }
    } catch {
      setError(t.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = "storefront-input placeholder:text-subdued focus:outline-none disabled:opacity-60";

  return (
    <TextPage title={common.contact} intro={<p>{t.intro}</p>}>
      {!sent ? (
        <form onSubmit={onSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="border border-sale px-4 py-3 text-[14px] leading-[1.5] text-sale">
              {error}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">{t.namePlaceholder}</span>
              <input
                className={fieldClass}
                placeholder={t.namePlaceholder}
                autoComplete="name"
                maxLength={MAX_NAME}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </label>
            <label className="block">
              <span className="sr-only">{t.emailPlaceholder}</span>
              <input
                type="email"
                className={fieldClass}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </label>
          </div>
          <label className="block">
            <span className="sr-only">{t.messagePlaceholder}</span>
            <textarea
              className={`${fieldClass} !h-auto min-h-[180px] resize-y`}
              placeholder={t.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE}
              required
              disabled={isLoading}
            />
            {message.length > MAX_MESSAGE - 300 && (
              <span className="mt-1 block text-right text-[12px] text-subdued">
                {t.charCount(message.length, MAX_MESSAGE)}
              </span>
            )}
          </label>
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              {t.honeypotLabel}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-ink w-full sm:w-auto sm:min-w-[200px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? t.sending : t.send}
            </button>
          </div>
        </form>
      ) : (
        <div className="border border-line px-6 py-10 text-center" role="status">
          <p className="sub">{t.sentTitle}</p>
          <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-[1.7] text-ink">{t.sent}</p>
        </div>
      )}
    </TextPage>
  );
}
