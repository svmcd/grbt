"use client";

import Link from "next/link";
import Image from "next/image";
import { getPriceForSlug } from "@/lib/pricing";
import { getImagesForSlug, getPrimaryImageForSlug, getProductBySlug } from "@/lib/catalog";
import { useFormatPrice, useLocale, useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import cardMessages from "@/i18n/messages/productCard";

const swatchColors: Record<string, string> = {
  siyah: "#000000",
  beyaz: "#ffffff",
};

interface ProductCardProps {
  product: {
    slug: string;
    city: string;
  };
}

// Product tile: image (second image on hover), "choose options" bar on hover,
// then title, price and color dots underneath.
export function ProductCard({ product }: ProductCardProps) {
  const { locale } = useLocale();
  const common = useMessages(commonMessages);
  const t = useMessages(cardMessages);
  const price = useFormatPrice();
  const productData = getProductBySlug(product.slug, locale);

  const primary = getPrimaryImageForSlug(product.slug);
  const secondary = getImagesForSlug(product.slug).find((src) => src !== primary);
  const colors = productData?.colors ?? ["siyah", "beyaz"];
  const href = `/product/${product.slug}`;

  return (
    <div className="group relative flex flex-col">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-paper">
        <Image
          src={primary}
          alt={t.imageAlt(product.city)}
          fill
          sizes="(max-width: 699px) 50vw, (max-width: 999px) 33vw, 25vw"
          className={
            "object-contain transition-opacity duration-500 " +
            (secondary ? "group-hover:opacity-0" : "")
          }
        />
        {secondary && (
          <Image
            src={secondary}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 699px) 50vw, (max-width: 999px) 33vw, 25vw"
            className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <span className="pointer-events-none absolute inset-x-4 bottom-4 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
          <span className="btn btn-paper w-full shadow-[0_0_0_1px_var(--line)]">{t.chooseOptions}</span>
        </span>
      </Link>

      <div className="flex flex-col items-start gap-2.5 px-4 pt-5 pb-6">
        <div className="flex flex-col gap-0.5">
          <Link href={href} className="sub text-ink">
            {product.city}
          </Link>
          <span className="sub text-subdued">{price(getPriceForSlug(product.slug))}</span>
        </div>
        <ul className="flex gap-2" aria-label={t.colorLegend}>
          {colors.map((c) => (
            <li key={c}>
              <span
                title={common.colors[c] ?? c}
                className="block h-4 w-4 rounded-full border border-line-strong"
                style={{ backgroundColor: swatchColors[c] ?? c }}
              />
              <span className="sr-only">{common.colors[c] ?? c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
