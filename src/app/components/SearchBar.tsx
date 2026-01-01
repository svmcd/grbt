"use client";

import { useState } from "react";
import { memleketSlugs, hasretSlugs, recepIvedikSlugs, getProductBySlug } from "@/lib/catalog";
import Link from "next/link";
import Image from "next/image";

// Normalize string for search (case-insensitive, accent-insensitive)
function normalizeForSearch(text: string): string {
  if (!text) return "";
  return (
    text
      .toLowerCase()
      // Handle Turkish characters first
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .replace(/I/g, "i")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "c")
      // Remove all other diacritics
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );
}

export function SearchBar({ isMobile = false }: { isMobile?: boolean }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      const searchTerm = normalizeForSearch(value);
      const allSlugs = [...memleketSlugs, ...hasretSlugs, ...recepIvedikSlugs];
      const filtered = allSlugs
        .map((slug) => getProductBySlug(slug))
        .filter(
          (product) =>
            product && normalizeForSearch(product.city).includes(searchTerm)
        )
        .slice(0, 5);
      setResults(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative group">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className={`w-full pl-10 pr-4 py-3 focus:outline-none rounded-none ${
            isMobile
              ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 text-base"
              : "bg-white/10 backdrop-blur-sm border border-black/20 text-black focus:bg-black focus:text-white focus:border-white/40 text-sm"
          }`}
          style={
            !isMobile
              ? ({
                  color: "black",
                  mixBlendMode: "difference",
                } as React.CSSProperties)
              : undefined
          }
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 group-focus-within:text-white/40"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      {isOpen && results.length > 0 && (
        <div
          className={`absolute left-0 right-0 bg-black border border-white/10 rounded-none overflow-hidden z-[60] ${
            isMobile ? "top-full mt-2" : "top-full mt-2"
          }`}
        >
          {results.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.city}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-light">
                  {product.city.toUpperCase()}
                </div>
                <div className="text-white/60 text-xs">
                  {hasretSlugs.includes(product.slug)
                    ? "Hasret"
                    : recepIvedikSlugs.includes(product.slug)
                    ? "Sinema"
                    : "Memleket"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
