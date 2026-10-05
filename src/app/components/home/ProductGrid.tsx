"use client";

import { getProductBySlug } from "@/lib/catalog";
import { ProductCard } from "@/app/components/ProductCard";
import { useLocale } from "@/i18n/LocaleProvider";

// Full-bleed product grid: 2 columns on phones, 3 on tablets, 4 on desktop.
// "dark" puts the white cards on the night background with 4px gaps between them.
export function ProductGrid({ slugs, dark = false }: { slugs: string[]; dark?: boolean }) {
  const { locale } = useLocale();
  const products = slugs
    .map((slug) => getProductBySlug(slug, locale))
    .filter((p): p is NonNullable<ReturnType<typeof getProductBySlug>> => !!p);

  return (
    <ul
      className={
        "grid grid-cols-2 min-[700px]:grid-cols-3 min-[1000px]:grid-cols-4 " +
        (dark ? "gap-1 bg-night" : "bg-paper")
      }
    >
      {products.map((p) => (
        <li key={p.slug} className="bg-paper text-ink">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
