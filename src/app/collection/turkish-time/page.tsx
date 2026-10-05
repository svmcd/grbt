"use client";

import { turkishTimeSlugs } from "@/lib/catalog";
import { CollectionView } from "@/app/components/home/CollectionView";
import { useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import collectionMessages from "@/i18n/messages/collections";

export default function TurkishTimeCollectionPage() {
  const common = useMessages(commonMessages);
  const t = useMessages(collectionMessages);

  return <CollectionView title={common.collections["turkish-time"]} text={t.turkishTimePageSubtitle} slugs={turkishTimeSlugs} />;
}
