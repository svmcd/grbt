"use client";

import { useEffect, useRef, useState } from "react";
import { locales, localeNames } from "./config";
import { useLocale, useMessages } from "./LocaleProvider";
import chromeMessages from "./messages/siteChrome";

// Compact language selector: "EN ▾" opening a small list of language names.
// The trigger inherits the surrounding text color (works on the transparent
// header, the white header and the dark footer); the list is always white.
export function LanguageSwitcher({
    className = "",
    direction = "down",
    align = "right",
    onOpenChange,
}: {
    className?: string;
    direction?: "down" | "up";
    align?: "left" | "right";
    onOpenChange?: (open: boolean) => void;
}) {
    const { locale, setLocale } = useLocale();
    const t = useMessages(chromeMessages).header;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onOpenChange?.(open);
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`${t.language}: ${localeNames[locale]}`}
                className="sub flex h-10 items-center gap-1.5"
            >
                <span>{locale}</span>
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                    className={"transition-transform duration-200 " + (open ? "rotate-180" : "")}
                >
                    <path d="M1.5 3.5 5 7l3.5-3.5" />
                </svg>
            </button>
            {open && (
                <ul
                    role="listbox"
                    aria-label={t.language}
                    className={
                        "absolute z-[70] min-w-[160px] border border-line bg-paper py-2 text-ink shadow-[0_4px_16px_rgba(28,28,28,0.08)] " +
                        (direction === "up" ? "bottom-full mb-1 " : "top-full mt-1 ") +
                        (align === "right" ? "right-0" : "left-0")
                    }
                >
                    {locales.map((l) => (
                        <li key={l}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={l === locale}
                                lang={l}
                                onClick={() => {
                                    setOpen(false);
                                    if (l !== locale) setLocale(l);
                                }}
                                className={
                                    "sub-xs flex w-full items-center justify-between gap-4 px-4 py-2 text-left transition-colors " +
                                    (l === locale ? "text-ink" : "text-subdued hover:text-ink")
                                }
                            >
                                <span className={l === locale ? "underline underline-offset-4" : ""}>{localeNames[l]}</span>
                                <span>{l.toUpperCase()}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Flat list of languages, for the mobile menu drawer.
export function LanguageList({ className = "" }: { className?: string }) {
    const { locale, setLocale } = useLocale();
    const t = useMessages(chromeMessages).header;
    return (
        <div className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`} role="group" aria-label={t.language}>
            {locales.map((l) => (
                <button
                    key={l}
                    type="button"
                    lang={l}
                    aria-pressed={l === locale}
                    onClick={() => l !== locale && setLocale(l)}
                    className={
                        "sub-xs py-1 transition-colors " +
                        (l === locale ? "text-ink underline underline-offset-4" : "text-subdued hover:text-ink")
                    }
                >
                    {localeNames[l]}
                </button>
            ))}
        </div>
    );
}
