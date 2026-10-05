"use client";

import { useEffect, useRef, useState } from "react";
import { memleketSlugs, hasretSlugs, recepIvedikSlugs, getProductBySlug, getPrimaryImageForSlug } from "@/lib/catalog";
import { getPriceForSlug } from "@/lib/pricing";
import Link from "@/i18n/LocaleLink";
import Image from "next/image";
import { useFormatPrice, useLocale, useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import chromeMessages from "@/i18n/messages/siteChrome";

// Normalize string for search (case-insensitive, accent-insensitive)
function normalizeForSearch(text: string): string {
  if (!text) return "";
  return (
    text
      .toLowerCase()
      // Handle Turkish characters first
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .replace(/I/g, "i")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "c")
      // Remove all other diacritics
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
  );
}

type SearchResult = NonNullable<ReturnType<typeof getProductBySlug>>;

// Matches the query against the city / design name of every product.
function useProductSearch(limit: number) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      const searchTerm = normalizeForSearch(value);
      const allSlugs = [...memleketSlugs, ...hasretSlugs, ...recepIvedikSlugs];
      const filtered = allSlugs
        .map((slug) => getProductBySlug(slug, locale))
        .filter(
          (product): product is SearchResult =>
            !!product && normalizeForSearch(product.city).includes(searchTerm)
        )
        .slice(0, limit);
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return { query, results, search, reset: () => search("") };
}

function collectionName(slug: string) {
  return hasretSlugs.includes(slug)
    ? "Hasret"
    : recepIvedikSlugs.includes(slug)
    ? "Sinema"
    : "Memleket";
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

// One result row: image, name, collection, price.
function ResultRow({ product, onClick }: { product: SearchResult; onClick: () => void }) {
  const price = useFormatPrice();
  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onClick}
      className="group flex items-center gap-4 py-3"
    >
      <div className="relative h-20 w-20 flex-shrink-0 border border-line bg-paper">
        <Image src={getPrimaryImageForSlug(product.slug)} alt={product.city} fill sizes="80px" className="object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="sub text-ink">
          <span className="link-reveal group-hover:bg-[length:100%_1px]">{product.city}</span>
        </div>
        <div className="sub-xs mt-1 text-subdued">{collectionName(product.slug)}</div>
        <div className="sub-xs mt-1 text-subdued">{price(getPriceForSlug(product.slug))}</div>
      </div>
    </Link>
  );
}

// Search drawer opened from the header search icon: slides in from the right
// (full width on phones). Empty query shows the collection links.
export function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useMessages(chromeMessages).search;
  const common = useMessages(commonMessages);
  const { query, results, search, reset } = useProductSearch(8);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div
      className={"fixed inset-0 z-[80] " + (open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        onClick={close}
        className={
          "absolute inset-0 bg-ink/40 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.placeholder}
        className={
          "absolute right-0 top-0 flex h-full w-full flex-col bg-paper text-ink transition-transform duration-300 ease-out sm:max-w-[480px] " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex h-[var(--header-h)] flex-shrink-0 items-center gap-3 border-b border-line px-4 sm:px-8">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder={t.placeholder}
            tabIndex={open ? 0 : -1}
            className="sub min-w-0 flex-1 bg-transparent lg:[&[type]]:!text-[13px] text-ink placeholder:text-subdued [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={close}
            aria-label={common.close}
            tabIndex={open ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {query.length === 0 ? (
            <div>
              <div className="sub-xs mb-4 text-subdued">{t.collections}</div>
              <ul className="flex flex-col gap-3">
                {(["memleket", "hasret", "sinema"] as const).map((key) => (
                  <li key={key}>
                    <Link
                      href={`/collection/${key}`}
                      onClick={close}
                      tabIndex={open ? 0 : -1}
                      className="sub link-reveal text-ink"
                    >
                      {common.collections[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : results.length === 0 ? (
            <p className="sub text-subdued">{t.noResults}</p>
          ) : (
            <div className="divide-y divide-line">
              {results.map((product) => (
                <ResultRow key={product.slug} product={product} onClick={close} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
