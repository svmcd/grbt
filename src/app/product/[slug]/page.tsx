"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-black flex p-8 flex-col items-center justify-between">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        <div className="relative w-full aspect-square border border-white/10 rounded-lg overflow-hidden bg-white/5">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl text-white font-light">{product.name}</h1>
          <p className="text-muted/80 mt-2">{product.city}</p>
          <p className="text-white mt-4">€{product.price}</p>
          <p className="text-muted/80 mt-4">{product.description}</p>

          <div className="mt-6">
            <div className="text-white/80 text-sm mb-2">Color</div>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <span key={c} className="px-3 py-1 border border-white/20 text-white/90 rounded text-sm">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-white/80 text-sm mb-2">Size</div>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <span key={s} className="px-3 py-1 border border-white/20 text-white/90 rounded text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <button className="mt-6 px-6 py-2 text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 whitespace-nowrap !bg-white">
            Add to cart
          </button>

          <div className="mt-6">
            <Link href="/" className="text-muted/70 hover:text-white underline underline-offset-4 text-sm">
              Back to collection
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-muted/100 w-full text-center pt-2 max-w-md mt-8">
        <p className="text-xs tracking-widest text-muted/100 uppercase">grbt.studio</p>
      </div>
    </div>
  );
}


