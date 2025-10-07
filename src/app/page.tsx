"use client";

import Image from "next/image";
import Link from "next/link";
import { memleketProducts } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex p-8 flex-col items-center justify-between">
      {/* Logo + Tagline */}
      <div className="items-center flex flex-col gap-2">
        <div className="flex justify-center">
          <Image
            src="/grbt.svg"
            alt="grbt."
            width={400}
            height={172}
            className="w-auto h-20 sm:h-24 lg:h-28"
            priority
          />
        </div>
        <p className="text-lg text-white font-light italic mb-2">
          Memleket Collection — şehirlerin hikayesi, tişörtlerde.
        </p>
      </div>

      {/* Grid */}
      <div className="w-full max-w-6xl text-center flex-1 flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {memleketProducts.map((p) => (
            <Link
              key={p.slug}
              href={`/product/${p.slug}`}
              className="group border border-white/10 rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-left">
                <div className="text-white font-light">{p.name}</div>
                <div className="text-muted/80 text-sm">{p.city}</div>
                <div className="text-white mt-2">€{p.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-muted/100 w-full text-center pt-2 max-w-md">
        <p className="text-xs tracking-widest text-muted/100 uppercase">
          grbt.studio
        </p>
      </div>
    </div>
  );
}
