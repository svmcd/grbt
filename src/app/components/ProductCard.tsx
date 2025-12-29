"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPriceForSlug } from "@/lib/pricing";
import {
  getPrimaryImageForSlug,
  getProductBySlug,
  hasretSlugs,
  recepIvedikSlugs,
} from "@/lib/catalog";

interface ProductCardProps {
  product: {
    slug: string;
    city: string;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const productData = getProductBySlug(product.slug);

  // Determine collection name
  const isHasretCollection = hasretSlugs.includes(product.slug);
  const isRecepIvedikCollection = recepIvedikSlugs.includes(product.slug);
  const collectionName = isHasretCollection
    ? "Hasret Koleksiyonu"
    : isRecepIvedikCollection
    ? "Sinema Koleksiyonu"
    : "Memleket Koleksiyonu";

  return (
    <div className="relative">
      <Link href={`/product/${product.slug}`} className="group block">
        {/* Main Image */}
        <div
          className="relative aspect-square mb-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-none blur-sm" />
          <Image
            src={getPrimaryImageForSlug(product.slug)}
            alt={`Memleket ${product.city}`}
            fill
            className={`object-contain transition-transform duration-500 relative z-10 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <div className="text-white/80 text-xs uppercase tracking-[0.3em] font-light font-serif">
            {collectionName}
          </div>
          <h3 className="text-white font-light text-xl group-hover:text-white/80 transition-colors font-serif">
            {product.city.toUpperCase()}
          </h3>
          <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
            {productData?.colors.join(" | ") || "beyaz | siyah"}
          </div>
          <div className="text-white/80 text-sm">
            €{getPriceForSlug(product.slug)}
          </div>
        </div>
      </Link>
    </div>
  );
}
