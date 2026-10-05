"use client";

import { useState } from "react";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import contactMessages from "@/i18n/messages/contactPage";
import commonMessages from "@/i18n/messages/common";
import { TextPage } from "@/app/components/pages/TextPage";

export default function ContactPage() {
  const { locale } = useLocale();
  const t = useMessages(contactMessages);
  const common = useMessages(commonMessages);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
        body: JSON.stringify({ name, email, message, locale }),
      });

      if (response.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(t.sendFailed);
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
              required
              disabled={isLoading}
            />
          </label>
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
