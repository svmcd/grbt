"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { SearchBar } from "./SearchBar";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toggleCart, getItemCount } = useCart();

  useEffect(() => {
    setIsMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 " +
        "bg-black " +
        (scrolled ? "border-b border-white/10" : "border-b border-transparent")
      }
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between py-2 sm:py-3 px-4 lg:px-0">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={mobileMenuOpen ? "/grbt-dark.svg" : "/grbt-dark.svg"}
            alt="grbt."
            width={120}
            height={50}
            className="h-5 sm:h-6 w-auto"
          />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/collection/memleket"
              className="text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              Memleket
            </Link>
            <Link
              href="/collection/hasret"
              className="text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              Hasret
            </Link>
            <Link
              href="/collection/sinema"
              className="text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              Sinema
            </Link>
            <Link
              href="/phone-case/kilim"
              className="text-white/80 hover:text-white transition-colors whitespace-nowrap text-xs"
            >
              Telefon Kılıfları
            </Link>
            <Link
              href="/contact"
              className="text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              İletişim
            </Link>
          </nav>
          
          {/* Tablet/Mobile Menu Button - Show on md screens too */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white/80 hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>

            {/* Desktop Cart */}
            <button
              onClick={toggleCart}
              data-cart-toggle
              className="hidden lg:block relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-none w-10 h-10 hover:bg-white/20 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 11-8 0" />
              </svg>
              {isMounted && getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm border border-white/20 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black border-t border-white/10">
          <div className="px-4 py-4 space-y-4">
            {/* Search Bar in Mobile Menu */}
            <div className="lg:hidden">
              <SearchBar isMobile={true} />
            </div>
            
            <nav className="space-y-3">
              <Link
                href="/"
                className="block text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <div className="pt-2 pb-1 border-t border-white/10">
                <div className="text-white/60 text-xs uppercase tracking-wider mb-2">
                  Koleksiyonlar
                </div>
                <Link
                  href="/collection/memleket"
                  className="block text-white/80 hover:text-white transition-colors pl-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Memleket Koleksiyonu
                </Link>
                <Link
                  href="/collection/hasret"
                  className="block text-white/80 hover:text-white transition-colors pl-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hasret Koleksiyonu
                </Link>
                <Link
                  href="/collection/sinema"
                  className="block text-white/80 hover:text-white transition-colors pl-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sinema Koleksiyonu
                </Link>
                <Link
                  href="/phone-case/kilim"
                  className="block text-white/80 hover:text-white transition-colors pl-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Telefon Kılıfları
                </Link>
              </div>
              <Link
                href="/contact"
                className="block text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
