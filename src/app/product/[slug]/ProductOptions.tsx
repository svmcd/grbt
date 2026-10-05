"use client";

import type { ReactNode } from "react";

// Shared building blocks for the product buy box: "LABEL: VALUE" headers,
// square option boxes, round color swatches and bordered expandable panels.

export function OptionLabel({ label, value, aside }: { label: string; value?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <p className="sub-xs text-subdued">
        {label}:{value !== undefined && <span className="ml-2 text-ink">{value}</span>}
      </p>
      {aside}
    </div>
  );
}

export function OptionBox({
  selected,
  onClick,
  children,
  className = "",
  style,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={style}
      className={
        "sub-xs flex min-h-[38px] min-w-[44px] items-center justify-center border border-solid! px-3 py-2 text-ink transition-colors " +
        (selected ? "border-ink!" : "border-line! hover:border-line-strong!") +
        " " +
        className
      }
    >
      {children}
    </button>
  );
}

const swatchFill: Record<string, string> = {
  siyah: "#1c1c1c",
  beyaz: "#ffffff",
};

export function Swatch({
  color,
  label,
  selected,
  onClick,
}: {
  color: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={
        "flex h-10 w-10 items-center justify-center rounded-full border border-solid! transition-colors " +
        (selected ? "border-ink!" : "border-transparent! hover:border-line-strong!")
      }
    >
      <span
        className="block h-8 w-8 rounded-full border border-line-strong"
        style={{ backgroundColor: swatchFill[color] ?? color }}
      />
    </button>
  );
}

// Bordered panel with a header row that opens/closes its body.
export function Panel({
  active,
  open,
  onToggle,
  header,
  children,
}: {
  active: boolean;
  open: boolean;
  onToggle?: () => void;
  header: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={"border transition-colors " + (active ? "border-ink" : "border-line")}>
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center gap-4 px-4 py-4 text-left"
        >
          <span className="min-w-0 flex-1">{header}</span>
          <Chevron open={open} />
        </button>
      ) : (
        <div className="px-4 py-4">{header}</div>
      )}
      {open && children && <div className="border-t border-line px-4 pt-4 pb-5">{children}</div>}
    </div>
  );
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={"shrink-0 text-ink transition-transform duration-200 " + (open ? "rotate-180" : "")}
      aria-hidden
    >
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

// Square check indicator used inside a <label> next to a hidden checkbox.
export function CheckSquare({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={
        "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors " +
        (checked ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper")
      }
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12l5 5 9-10" />
        </svg>
      )}
    </span>
  );
}

// Small heading used inside panels (e.g. "FONT", "PREVIEW").
export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="sub-xs mb-2 block text-subdued">
      {children}
    </label>
  );
}
