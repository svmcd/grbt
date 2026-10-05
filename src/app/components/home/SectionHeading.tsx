import Link from "@/i18n/LocaleLink";

// "→ NAME" section heading with an optional VIEW ALL button on the right.
export function SectionHeading({
  title,
  text,
  href,
  linkLabel,
  linkContext,
  dark = false,
}: {
  title: string;
  text?: string;
  href?: string;
  linkLabel?: string;
  /** Full name for screen readers, e.g. "Memleket Collection" */
  linkContext?: string;
  dark?: boolean;
}) {
  return (
    <div className="px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        <h2 className="h-section flex min-w-0 items-center gap-3 lg:gap-4">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            className="h-[0.8em] w-[0.8em] shrink-0"
          >
            <path d="M3 12h18M14 5l7 7-7 7" />
          </svg>
          <span className="min-w-0">{title}</span>
        </h2>
        {href && linkLabel && (
          <Link
            href={href}
            className={"btn shrink-0 px-4 sm:px-6 lg:px-8 " + (dark ? "btn-outline-paper" : "btn-outline-ink")}
          >
            {linkLabel}
            {linkContext && <span className="sr-only">: {linkContext}</span>}
          </Link>
        )}
      </div>
      {text && <p className={"sub mt-4 max-w-2xl " + (dark ? "text-night-subdued" : "text-ink")}>{text}</p>}
    </div>
  );
}
