"use client";

import { ProductGrid } from "@/app/components/home/ProductGrid";
import { useMessages } from "@/i18n/LocaleProvider";
import collectionMessages from "@/i18n/messages/collections";

// Collection page body: name and one-line description, "N PRODUCTS" bar, full-bleed grid.
export function CollectionView({ title, text, slugs }: { title: string; text: string; slugs: string[] }) {
  const t = useMessages(collectionMessages);

  return (
    <div className="bg-paper text-ink">
      <header className="px-4 pb-10 pt-10 sm:px-8 lg:px-12 lg:pb-14 lg:pt-16">
        <h1 className="h-section">{title}</h1>
        <p className="sub mt-5 max-w-2xl">{text}</p>
      </header>
      <div className="flex h-14 items-center border-y border-line px-4 sm:px-8 lg:h-[70px] lg:px-7">
        <p className="sub">{t.productCount(slugs.length)}</p>
      </div>
      <div className="pt-4 lg:pt-6">
        <ProductGrid slugs={slugs} />
      </div>
    </div>
  );
}
