import type { ReactNode } from "react";

// Shared layout for text pages (policies, support, track, contact):
// container gutters 16/32/48px, a ~720px text column, uppercase title.
export function TextPage({
  title,
  intro,
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="bg-paper text-ink">
      <div className="px-4 pb-20 pt-12 md:px-8 md:pb-28 md:pt-16 lg:px-12 lg:pt-20">
        <div className="mx-auto w-full max-w-[720px]">
          <h1 className="h-section break-words">{title}</h1>
          {intro && <div className="mt-6 text-[14px] leading-[1.7] text-ink">{intro}</div>}
          {children && <div className="mt-10">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export function TextSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="sub mb-3">{title}</h2>
      <div className="text-[14px] leading-[1.7] text-ink">{children}</div>
    </section>
  );
}
