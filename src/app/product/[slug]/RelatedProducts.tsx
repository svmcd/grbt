"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { hasretSlugs, memleketSlugs, getProductBySlug } from "@/lib/catalog";
import { ProductCard } from "@/app/components/ProductCard";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import productPageMessages from "@/i18n/messages/productPage";

const FALLBACK_BAND = "/media/hero-desktop.png";

// Full-width photo band: the product's own lifestyle photo when it has one
// (`photo`, decided on the server from extra-photos.json), otherwise the general
// clothing-rack photo.
export function ImageBand({ photo, city }: { photo: string | null; city: string }) {
  const t = useMessages(productPageMessages);
  const src = photo ?? FALLBACK_BAND;

  return (
    <div className="relative mt-16 aspect-[4/5] w-full bg-night sm:aspect-[16/10] lg:mt-24 lg:aspect-auto lg:h-[85vh]">
      <Image
        src={src}
        alt={photo ? t.bandAltProduct(city) : t.bandAltGeneric}
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

export function RelatedProducts({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const t = useMessages(productPageMessages);
  const [related, setRelated] = useState<{ slug: string; city: string }[]>([]);

  // Random picks on the client only, so server and client markup match.
  useEffect(() => {
    const pool = [...memleketSlugs, ...hasretSlugs].filter((s) => s !== slug);
    const picks = pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    setRelated(
      picks
        .map((s) => getProductBySlug(s, locale))
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map((p) => ({ slug: p.slug, city: p.city }))
    );
  }, [slug, locale]);

  if (related.length === 0) return null;

  return (
    <section className="pt-16 lg:pt-24">
      <h2 className="h-section px-4 pb-8 text-ink sm:px-8 lg:px-12 lg:pb-10">{t.relatedTitle}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
