"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { POPULAR_SHIPPING_COUNTRIES, SHIPPING_COUNTRY_CODES, getCountryName } from "@/lib/shipping";

// Searchable shipping country picker for the cart drawer (ARIA 1.2 combobox with a listbox popup).
// Type to filter (localized name, English name or ISO code), arrow keys to move, Enter to choose,
// Escape to close. Without a search it lists a short popular group, then every country A-Z.

type CountryOption = { code: string; name: string; search: string };
type Section = { label?: string; options: CountryOption[] };

type Labels = {
  placeholder: string;
  popular: string;
  all: string;
  noResults: string;
  results: (count: number) => string;
};

// Lowercase without accents; Turkish dotless i matches i, so "isvicre" finds "İsviçre"
function normalize(value: string, intlLocale: string): string {
  return value
    .toLocaleLowerCase(intlLocale)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

function englishNames(): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={"transition-transform duration-200 " + (open ? "rotate-180" : "")}
    >
      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" strokeLinecap="square" />
    </svg>
  );
}

export function CountryCombobox({
  id,
  value,
  onChange,
  locale,
  intlLocale,
  labels,
}: {
  id: string;
  value: string;
  onChange: (code: string) => void;
  locale: Locale;
  intlLocale: string;
  labels: Labels;
}) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  // null while not searching: the field then shows the selected country
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const countries = useMemo<CountryOption[]>(() => {
    const english = englishNames();
    const collator = new Intl.Collator(intlLocale);
    return SHIPPING_COUNTRY_CODES.map((code) => {
      const name = getCountryName(code, locale);
      const en = english?.of(code) ?? "";
      return { code, name, search: normalize(`${name} ${en}`, intlLocale) };
    }).sort((a, b) => collator.compare(a.name, b.name));
  }, [locale, intlLocale]);

  const sections = useMemo<Section[]>(() => {
    const q = query ? normalize(query, intlLocale) : "";
    if (!q) {
      const popular = POPULAR_SHIPPING_COUNTRIES.map((code) => countries.find((c) => c.code === code)).filter(
        (c): c is CountryOption => Boolean(c)
      );
      return [
        { label: labels.popular, options: popular },
        { label: labels.all, options: countries },
      ];
    }
    // Names that start with the search first, then names with a word starting with it, then the rest
    const upper = q.toUpperCase();
    const popularRank = (code: string) => {
      const i = POPULAR_SHIPPING_COUNTRIES.indexOf(code);
      return i === -1 ? POPULAR_SHIPPING_COUNTRIES.length : i;
    };
    const rank = (c: CountryOption) =>
      c.code === upper || c.search.startsWith(q) ? 0 : c.search.split(/[\s(),.-]+/).some((w) => w.startsWith(q)) ? 1 : 2;
    const matches = countries
      .filter((c) => c.code === upper || c.search.includes(q))
      .map((c) => ({ c, r: rank(c) }))
      // Within a rank, the countries people order from most come first ("türk" → Türkiye)
      .sort((a, b) => a.r - b.r || popularRank(a.c.code) - popularRank(b.c.code))
      .map(({ c }) => c);
    return [{ options: matches }];
  }, [query, countries, intlLocale, labels.popular, labels.all]);

  const flat = useMemo(() => sections.flatMap((s) => s.options), [sections]);
  const searching = Boolean(query && query.trim());
  const selectedName = value ? countries.find((c) => c.code === value)?.name ?? value : "";

  // Keep the highlighted option visible while moving with the keyboard
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(`${baseId}-opt-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, baseId]);

  const openList = () => {
    setOpen(true);
    const selected = flat.findIndex((c) => c.code === value);
    setActiveIndex(selected);
  };

  const close = () => {
    setOpen(false);
    setQuery(null);
    setActiveIndex(-1);
  };

  // Back to showing the chosen country, selected so that typing starts a new search
  const closeAndSelect = () => {
    close();
    requestAnimationFrame(() => {
      if (document.activeElement === inputRef.current) inputRef.current?.select();
    });
  };

  const choose = (code: string) => {
    onChange(code);
    closeAndSelect();
  };

  // Leaving the field after typing a full name ("Türkiye") or narrowing to one country selects it;
  // anything else keeps the previous choice
  const onBlur = () => {
    const typed = query?.trim() ? normalize(query.trim(), intlLocale) : "";
    if (typed) {
      const exact = flat.find((c) => normalize(c.name, intlLocale) === typed || c.code.toLowerCase() === typed);
      const only = flat.length === 1 ? flat[0] : undefined;
      const pick = exact ?? only;
      if (pick && pick.code !== value) onChange(pick.code);
    }
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) {
          openList();
          return;
        }
        if (flat.length === 0) return;
        const step = e.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((i) => (i < 0 ? (step > 0 ? 0 : flat.length - 1) : (i + step + flat.length) % flat.length));
        return;
      }
      case "Enter":
        if (open && activeIndex >= 0 && flat[activeIndex]) {
          e.preventDefault();
          choose(flat[activeIndex].code);
        }
        return;
      case "Escape":
        // Close the list (or drop the search) without closing the cart drawer
        if (open || query !== null) {
          e.preventDefault();
          e.stopPropagation();
          closeAndSelect();
        }
        return;
      case "Tab":
        if (open) close();
        return;
    }
  };

  let optionIndex = 0;

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={labels.placeholder}
          value={query ?? selectedName}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(e.target.value.trim() ? 0 : -1);
          }}
          onFocus={(e) => {
            e.target.select();
            openList();
          }}
          onClick={() => {
            if (!open) openList();
          }}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="storefront-input pr-11 text-[16px] outline-none placeholder:text-subdued sm:text-[14px]"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink">
          <ChevronIcon open={open} />
        </span>
      </div>

      {/* Opens upwards: the picker sits at the bottom of the drawer */}
      <div
        id={listId}
        role="listbox"
        aria-labelledby={`${id}-label`}
        hidden={!open}
        // Keep focus in the field when an option is pressed
        onMouseDown={(e) => e.preventDefault()}
        className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-[min(320px,45vh)] overflow-y-auto overscroll-contain border border-ink bg-paper"
      >
        {flat.length === 0 ? (
          <p className="px-4 py-3 text-[14px] text-subdued">{labels.noResults}</p>
        ) : (
          sections.map((section, s) => {
            const headingId = `${baseId}-group-${s}`;
            const options = section.options.map((c) => {
              const index = optionIndex++;
              const selected = c.code === value;
              const active = index === activeIndex;
              return (
                <div
                  key={`${s}-${c.code}`}
                  id={`${baseId}-opt-${index}`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(c.code)}
                  onMouseMove={() => {
                    if (activeIndex !== index) setActiveIndex(index);
                  }}
                  className={
                    "flex min-h-[44px] cursor-pointer items-center justify-between gap-3 px-4 py-2 text-[14px] leading-[1.4] text-ink " +
                    (active ? "bg-line" : "")
                  }
                >
                  <span>{c.name}</span>
                  {selected && <CheckIcon />}
                </div>
              );
            });
            return section.label ? (
              <div key={s} role="group" aria-labelledby={headingId} className={s > 0 ? "border-t border-line" : ""}>
                <div id={headingId} role="presentation" className="sub-xs px-4 pb-1 pt-3 text-subdued">
                  {section.label}
                </div>
                {options}
              </div>
            ) : (
              <div key={s}>{options}</div>
            );
          })
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {open && searching ? (flat.length ? labels.results(flat.length) : labels.noResults) : ""}
      </p>
    </div>
  );
}
