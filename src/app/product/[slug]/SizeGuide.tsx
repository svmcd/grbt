"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import productPageMessages from "@/i18n/messages/productPage";
import type { GarmentType } from "@/lib/garments";
import { cmToInch, sizeChart, type SizeMeasurements } from "@/lib/size-chart";

type Unit = "cm" | "inch";

const ROWS: { key: keyof Omit<SizeMeasurements, "size">; label: "chest" | "length" | "shoulder" | "sleeve" }[] = [
  { key: "chest", label: "chest" },
  { key: "length", label: "length" },
  { key: "shoulder", label: "shoulder" },
  { key: "sleeve", label: "sleeve" },
];

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// "Size guide" link next to the size label, opening Cloprod's chart for the selected garment
// in a modal dialog: a bottom sheet on phones, centred from 640px. Native <dialog> keeps the
// page behind it inert; Tab is also kept inside, Escape and the backdrop close it, and focus
// goes back to the link.
export function SizeGuide({ type }: { type: GarmentType }) {
  const common = useMessages(commonMessages);
  const t = useMessages(productPageMessages).sizeGuide;
  const { intlLocale } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<Unit>("cm");
  const titleId = useId();
  const descId = useId();

  const rows = sizeChart(type);
  const garment = common.productTypes[type];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      const root = document.documentElement;
      const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
      // No page scroll behind the dialog, without the page jumping where the scrollbar was
      root.style.scrollbarGutter = "stable";
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = previous.overflow;
        root.style.scrollbarGutter = previous.gutter;
      };
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Keep Tab and Shift+Tab inside the dialog
  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab") return;
    const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const format = (cm: number) => {
    const value = unit === "cm" ? cm : cmToInch(cm);
    const digits = unit === "inch" ? 1 : Number.isInteger(cm) ? 0 : 1;
    return new Intl.NumberFormat(intlLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  };

  if (rows.length === 0) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="sub-xs shrink-0 text-ink underline underline-offset-4"
      >
        {t.open}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
        // Escape: the browser closes the dialog; keep the state in step
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        // A click on the backdrop lands on the <dialog> element itself
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88dvh] w-full max-w-none overflow-y-auto bg-paper p-0 text-ink backdrop:bg-night/50 sm:inset-0 sm:m-auto sm:h-fit sm:w-[560px] sm:max-w-[calc(100%-32px)]"
      >
        {open && (
          <div className="px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 id={titleId} className="sub text-ink">
                  {t.title(garment)}
                </h2>
                <p id={descId} className="mt-1 text-[12px] leading-[1.5] text-subdued">
                  {t.intro}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t.close}
                className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                  <path d="M4 4l16 16M20 4L4 20" strokeLinecap="square" />
                </svg>
              </button>
            </div>

            {/* Unit toggle */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="sub-xs text-subdued" id={`${titleId}-unit`}>
                {t.unitsLabel}
              </span>
              <div role="radiogroup" aria-labelledby={`${titleId}-unit`} className="flex border border-line">
                {(["cm", "inch"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    role="radio"
                    aria-checked={unit === u}
                    onClick={() => setUnit(u)}
                    className={
                      "sub-xs min-h-[34px] min-w-[56px] px-3 transition-colors " +
                      (unit === u ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-line")
                    }
                  >
                    {t[u]}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart: sizes as columns */}
            <table className="mt-4 w-full table-fixed border-collapse text-[12px] leading-[1.35]">
              <caption className="sr-only">
                {t.title(garment)} ({t[unit]})
              </caption>
              <colgroup>
                <col className="w-[34%] sm:w-[30%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="sub-xs py-2 pr-2 text-left font-normal text-subdued">
                    {t.size}
                  </th>
                  {rows.map((r) => (
                    <th key={r.size} scope="col" className="sub-xs py-2 text-center font-normal text-ink">
                      {r.size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-line">
                    <th scope="row" className="py-2.5 pr-2 text-left align-top font-normal text-ink">
                      {t[row.label]}
                      {row.key === "chest" && <span className="block text-[11px] text-subdued">{t.chestHint}</span>}
                    </th>
                    {rows.map((r) => (
                      <td key={r.size} className="py-2.5 text-center align-top tabular-nums text-ink">
                        {format(r[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4 text-[12px] leading-[1.5] text-subdued">{t.tolerance}</p>
          </div>
        )}
      </dialog>
    </>
  );
}
