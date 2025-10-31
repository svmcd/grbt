"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { useCart } from "@/lib/cart-context";

export function MobileFloatingElements() {
  const [isMounted, setIsMounted] = useState(false);
  const { toggleCart, getItemCount } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="sm:hidden fixed bottom-3 left-4 right-4 z-40 flex items-center gap-3">
      {/* Mobile Floating Search */}
      <div className="flex-1">
        <SearchBar isMobile={true} />
      </div>

      {/* Mobile Floating Cart */}
      <button
        onClick={toggleCart}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-none w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-black"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 11-8 0" />
        </svg>
        {isMounted && getItemCount() > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-black/90 backdrop-blur-sm border border-white text-white text-xs rounded-none w-5 h-5 flex items-center justify-center"
            style={{
              backgroundColor: "var(--black)",
              border: "10px solid var(--white)",
            }}
          >
            {getItemCount()}
          </span>
        )}
      </button>
    </div>
  );
}
