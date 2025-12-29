"use client";

import Image from "next/image";
import Link from "next/link";
import { recepIvedikSlugs, getProductBySlug } from "@/lib/catalog";
import { ProductCard } from "@/app/components/ProductCard";

export default function RecepIvedikCollectionPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-light text-white mb-6 font-serif">
              Sinema Koleksiyonu
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
              Türk sinemasından ilham alan özel tasarımlar. Her parça bir hatıra, bir gülümseme.
            </p>
            <div className="text-white/40 text-sm">
              {recepIvedikSlugs.length} tasarım • Her biri özel hikaye
            </div>
          </div>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recepIvedikSlugs
              .map((slug) => getProductBySlug(slug))
              .filter(
                (p): p is NonNullable<ReturnType<typeof getProductBySlug>> =>
                  !!p
              )
              .map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

