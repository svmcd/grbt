"use client";

import Link from "next/link";
import Image from "next/image";
import { memleketSlugs, hasretSlugs, recepIvedikSlugs } from "@/lib/catalog";
import { FamilyOffer } from "@/app/components/FamilyOffer";
import { ProductGrid } from "@/app/components/home/ProductGrid";
import { SectionHeading } from "@/app/components/home/SectionHeading";
import { CollectionTiles } from "@/app/components/home/CollectionTiles";
import { useFormatPrice, useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import homeMessages from "@/i18n/messages/home";
import collectionMessages from "@/i18n/messages/collections";
import sectionMessages from "@/i18n/messages/homeSections";

// Header contract (see Header.tsx): on "/" the chrome reserves only the announcement bar
// and the transparent header overlays the hero, so the hero is the first element, has no
// top margin and fills the screen below the announcement bar.
const HERO_HEIGHT = "h-[calc(100svh-var(--announcement-h))]";

// Memleket products shown on the homepage before "View all"
const MEMLEKET_PREVIEW = 8;

export default function Home() {
  const t = useMessages(homeMessages);
  const tc = useMessages(collectionMessages);
  const common = useMessages(commonMessages);
  const family = useMessages(sectionMessages).family;
  const eur = useFormatPrice();

  return (
    <div className="bg-paper text-ink">
      {/* Hero */}
      <section
        className={
          "relative isolate flex min-h-[520px] items-center justify-center overflow-hidden px-4 text-center text-paper " +
          HERO_HEIGHT
        }
      >
        <Image
          src="/media/hero-desktop.png"
          alt={t.heroAlt}
          fill
          priority
          sizes="100vw"
          className="-z-10 hidden object-cover sm:block"
        />
        <Image
          src="/media/hero-mobile.png"
          alt={t.heroAlt}
          fill
          priority
          sizes="100vw"
          className="-z-10 block object-cover sm:hidden"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink/20" />

        <div className="flex max-w-5xl flex-col items-center">
          <h1 className="display">
            {t.heroTitle.line1}
            <br />
            {t.heroTitle.line2}
            <br />
            {t.heroTitle.line3}
          </h1>
          <p className="sub-xs mt-8 max-w-xl font-semibold text-balance">
            {t.offers.freeShipping(eur(100))} • {t.offers.family(eur(5), eur(10))}
          </p>
        </div>
      </section>

      {/* Memleket */}
      <section>
        <SectionHeading
          title="Memleket"
          text={tc.memleketSubtitle}
          href="/collection/memleket"
          linkLabel={tc.viewAll}
          linkContext={common.collections.memleket}
        />
        <ProductGrid slugs={memleketSlugs.slice(0, MEMLEKET_PREVIEW)} />
      </section>

      {/* Memleket family offer */}
      <section className="border-t border-line px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid items-end gap-10 min-[1000px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <p className="sub-xs">{family.badge}</p>
            <h2 className="h-section mt-5">{family.title}</h2>
            <p className="sub mt-5 max-w-md">{family.hook}</p>
            <Link href="/collection/memleket" className="btn btn-ink mt-8">
              {t.shopMemleket}
            </Link>
          </div>
          <FamilyOffer showHeading={false} />
        </div>
      </section>

      {/* Sinema, dark featured collection */}
      <section className="bg-night text-paper">
        <SectionHeading
          title="Sinema"
          text={tc.sinemaSubtitle}
          href="/collection/sinema"
          linkLabel={tc.viewAll}
          linkContext={common.collections.sinema}
          dark
        />
        <ProductGrid slugs={recepIvedikSlugs} dark />
        <div className="h-14 lg:h-16" />
      </section>

      {/* Hasret */}
      <section>
        <SectionHeading
          title="Hasret"
          text={tc.hasretSubtitle}
          href="/collection/hasret"
          linkLabel={tc.viewAll}
          linkContext={common.collections.hasret}
        />
        <ProductGrid slugs={hasretSlugs} />
      </section>

      {/* Collection tiles */}
      <div className="border-t border-line">
        <CollectionTiles />
      </div>
    </div>
  );
}
