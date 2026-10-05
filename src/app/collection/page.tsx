"use client";

import { CollectionTiles } from "@/app/components/home/CollectionTiles";
import { useMessages } from "@/i18n/LocaleProvider";
import collectionMessages from "@/i18n/messages/collections";

// All collections as image tiles. The "continue shopping" links in the cart,
// checkout, product and order pages land here.
export default function CollectionIndexPage() {
  const t = useMessages(collectionMessages);
  return <CollectionTiles title={t.indexTitle} as="h1" />;
}
