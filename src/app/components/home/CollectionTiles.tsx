"use client";

import Link from "@/i18n/LocaleLink";
import Image from "next/image";
import { useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import collectionMessages from "@/i18n/messages/collections";

const tiles = [
  {
    key: "memleket",
    name: "Memleket",
    href: "/collection/memleket",
    image: "/products/collections/memleket/nevsehir/siyah/back.png",
  },
  {
    key: "hasret",
    name: "Hasret",
    href: "/collection/hasret",
    image: "/products/collections/hasret/gurbetten-memlekete/siyah/back.png",
  },
  {
    key: "sinema",
    name: "Sinema",
    href: "/collection/sinema",
    image: "/products/collections/recep_ivedik/sensiz_olmaz/front_black.png",
  },
] as const;

// Heading, one line of text and a big image tile per collection with a white button in the middle.
// Phones get a horizontal scroller, larger screens three tiles side by side.
export function CollectionTiles({ title, as = "h2" }: { title?: string; as?: "h1" | "h2" }) {
  const t = useMessages(collectionMessages);
  const common = useMessages(commonMessages);
  const Heading = as;

  return (
    <section className="bg-paper py-14 text-ink lg:py-20">
      <div className="px-4 sm:px-8 lg:px-12">
        <Heading className="h-section">{title ?? t.tiles.title}</Heading>
        <p className="sub mt-6">{t.tiles.text}</p>
      </div>

      <ul className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-8 lg:mt-12 lg:gap-12 lg:px-12 [&::-webkit-scrollbar]:hidden">
        {tiles.map((tile) => (
          <li key={tile.key} className="w-[80%] shrink-0 snap-start scroll-ml-4 sm:w-auto">
            <Link
              href={tile.href}
              aria-label={common.collections[tile.key]}
              className="group relative block aspect-square overflow-hidden bg-line"
            >
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 639px) 80vw, 33vw"
                className="object-contain p-[10%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="btn btn-paper group-hover:bg-ink group-hover:text-paper">{tile.name}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
