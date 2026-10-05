import Link from "@/i18n/LocaleLink";
import { getMessages } from "@/i18n/server";
import notFoundMessages from "@/i18n/messages/notFound";

export default async function NotFound() {
  const t = await getMessages(notFoundMessages);
  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--announcement-h,46px)-var(--header-h,74px))] items-center justify-center overflow-hidden bg-night px-4 py-24 text-center text-paper">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex select-none items-center justify-center font-normal leading-none tracking-[-0.05em] text-paper/[0.06]"
        style={{ fontSize: "clamp(200px, 42vw, 560px)" }}
      >
        404
      </span>
      <div className="flex max-w-xl flex-col items-center">
        <h1 className="h-section">{t.title}</h1>
        <p className="sub mt-5 text-night-subdued">{t.text}</p>
        <Link href="/" className="btn btn-paper mt-9">
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
