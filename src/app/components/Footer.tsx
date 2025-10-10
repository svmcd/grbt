"use client";

import Link from "next/link";
import Image from "next/image";
import { NewsletterSignup } from "./NewsletterSignup";
import { TrustSignals } from "./TrustSignals";

export function Footer() {
  return (
    <footer className="w-full mt-16 pb-20 sm:pb-32">
      <div className="border-t border-white/10" />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Image
              src="/grbt-dark.svg"
              alt="grbt."
              width={120}
              height={50}
              className="h-8 w-auto mb-6"
            />

            <div className="text-sm text-white/70 space-y-2 mb-6">
              <div>Vrijheidweg 22</div>
              <div>1521RR, Wormerveer, Hollanda</div>
              <div>+31 6 2881 2182</div>
              <div>info@grbt.studio</div>
            </div>

            <div className="text-sm text-white/70 space-x-6">
              <Link
                href="https://instagram.com/studio.grbt"
                className="hover:text-white transition-colors"
              >
                Instagram
              </Link>
              <Link
                href="https://tiktok.com/@grbt.studio"
                className="hover:text-white transition-colors"
              >
                TikTok
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <NewsletterSignup />
          </div>

          {/* Help */}
          <div>
            <div className="text-white/90 text-sm mb-4 uppercase tracking-wide font-serif">
              Yardım
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/track"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Siparişimi Takip Et
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Kargo Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  İade Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Destek
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-white/90 text-sm mb-4 uppercase tracking-wide font-serif">
              Şirket
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10" />
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between text-xs text-white/60">
        <span>© {new Date().getFullYear()} grbt.studio</span>
        <div className="space-x-4">
          <Link href="/privacy" className="hover:text-white">
            Gizlilik Politikası
          </Link>
          <Link href="/terms" className="hover:text-white">
            Şartlar ve Koşullar
          </Link>
        </div>
      </div>
    </footer>
  );
}
