"use client";

/*
 * Site chrome: announcement bar + header (both fixed to the top of the viewport).
 *
 * LAYOUT CONTRACT (for page authors)
 * - Heights are CSS variables defined in app/layout.tsx:
 *     --announcement-h  (40px, 46px from 1024px = lg)
 *     --header-h        (60px, 74px from 1024px = lg)
 * - This component renders an in-flow spacer before <main>, so pages never
 *   need top padding for the chrome:
 *     * every page except "/": spacer = announcement + header, content starts
 *       right below the white header.
 *     * "/": spacer = announcement only. The transparent header (white logo
 *       and text) overlays the first section of the page. The homepage hero
 *       must therefore be the first element of the page, with no top margin
 *       or padding, and fill the screen below the announcement bar:
 *         className="relative h-[calc(100svh-var(--announcement-h))] ..."
 *       Keep hero text clear of the top var(--header-h) (center or bottom
 *       align it) and make sure the top of the hero image is dark enough for
 *       white text, e.g. a gradient from rgba(0,0,0,.35) at the top.
 *   On "/" the header turns white (dark logo/text) after 10px of scroll, on
 *   mouse hover and while the language list is open.
 * - Overlays: header z-50, search drawer and mobile menu z-[80]. The cart
 *   opens through toggleCart() from useCart() (CartDrawer renders it).
 */

import Link from "@/i18n/LocaleLink";
import Image from "next/image";
import { useMessages, usePlainPathname } from "@/i18n/LocaleProvider";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { SearchDrawer } from "./SearchBar";
import { LanguageList, LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import commonMessages from "@/i18n/messages/common";
import chromeMessages from "@/i18n/messages/siteChrome";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  "aria-hidden": true,
} as const;

// Locks page scroll while a drawer is open (html element, so it does not
// conflict with the cart drawer, which locks <body>).
function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [locked]);
}

export function Header() {
  const pathname = usePlainPathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toggleCart, getItemCount } = useCart();
  const common = useMessages(commonMessages);
  const chrome = useMessages(chromeMessages);
  const t = chrome.header;

  useEffect(() => {
    setIsMounted(true);
    const onScroll = () => {
      // The cart drawer pins <body> (scrollY becomes 0); keep the current state.
      if (document.body.hasAttribute("data-scroll-y")) return;
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawers when navigating
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useScrollLock(menuOpen || searchOpen);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const solid = !isHome || scrolled || hovered || langOpen;
  const count = isMounted ? getItemCount() : 0;

  const navLinks = [
    { href: "/", label: common.home },
    { href: "/collection/memleket", label: "Memleket" },
    { href: "/collection/hasret", label: "Hasret" },
    { href: "/collection/sinema", label: "Sinema" },
    { href: "/contact", label: common.contact },
  ];
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const iconButton = "flex h-10 w-10 items-center justify-center";

  return (
    <>
      {/* In-flow spacer: pages start below the chrome (on "/" below the announcement only) */}
      <div
        aria-hidden
        className="flex-shrink-0"
        style={{
          height: isHome
            ? "var(--announcement-h)"
            : "calc(var(--announcement-h) + var(--header-h))",
        }}
      />

      <div className="fixed inset-x-0 top-0 z-50">
        <div className="sub-xs flex h-[var(--announcement-h)] items-center justify-center bg-night px-3 text-center text-paper max-sm:text-[11px] max-sm:tracking-[0.02em]">
          <p className="truncate">{chrome.announcement}</p>
        </div>

        <header
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className={
            "h-[var(--header-h)] border-b transition-colors duration-300 " +
            (solid
              ? "border-line bg-paper text-ink"
              : "border-transparent bg-transparent text-paper")
          }
        >
          <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-2 md:px-6 lg:flex lg:px-8">
            {/* Mobile / tablet left: menu + search */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t.menu}
                aria-expanded={menuOpen}
                className={iconButton}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps}>
                  <path d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t.search}
                className={iconButton}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" {...iconProps}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <Link
              href="/"
              aria-label={common.brand}
              className="relative block justify-self-center lg:mr-12 lg:flex-shrink-0"
            >
              <Image
                src="/egrikuyu.svg"
                alt={common.brand}
                width={1983}
                height={644}
                priority
                className={"h-[30px] w-auto lg:h-[40px] " + (solid ? "" : "invisible")}
              />
              <Image
                src="/egrikuyu-white.svg"
                alt=""
                aria-hidden
                width={1983}
                height={644}
                priority
                className={
                  "absolute inset-0 h-[30px] w-auto lg:h-[40px] " + (solid ? "invisible" : "")
                }
              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-6 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="sub link-reveal whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: language, search, cart */}
            <div className="flex items-center justify-end lg:ml-auto">
              <LanguageSwitcher className="mr-3 hidden lg:block" onOpenChange={setLangOpen} />
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t.search}
                className={iconButton + " hidden lg:flex"}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" {...iconProps}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={toggleCart}
                data-cart-toggle
                aria-label={count > 0 ? `${t.cart} (${count})` : t.cart}
                className={iconButton + " relative"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps}>
                  <path d="M5 8h14l-1 13H6L5 8Z" />
                  <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                </svg>
                {count > 0 && (
                  <span
                    className={
                      "absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] leading-none transition-colors duration-300 " +
                      (solid ? "bg-ink text-paper" : "bg-paper text-ink")
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={"fixed inset-0 z-[80] lg:hidden " + (menuOpen ? "" : "pointer-events-none")}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={
            "absolute inset-0 bg-ink/40 transition-opacity duration-300 " +
            (menuOpen ? "opacity-100" : "opacity-0")
          }
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.menu}
          className={
            "absolute left-0 top-0 flex h-full w-[min(88vw,400px)] flex-col bg-paper text-ink transition-transform duration-300 ease-out " +
            (menuOpen ? "translate-x-0" : "-translate-x-full")
          }
        >
          <div className="flex h-[var(--header-h)] flex-shrink-0 items-center border-b border-line px-2 md:px-6">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={common.close}
              tabIndex={menuOpen ? 0 : -1}
              className={iconButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href} className="border-b border-line">
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    tabIndex={menuOpen ? 0 : -1}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 text-[22px] uppercase leading-none tracking-[-0.04em]"
                  >
                    {link.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" {...iconProps}>
                      <path d="m9 5 7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex-shrink-0 border-t border-line px-6 py-6 md:px-8">
            <div className="sub-xs mb-3 text-subdued">{t.language}</div>
            <LanguageList />
          </div>
        </div>
      </div>

      <SearchDrawer open={searchOpen} onClose={closeSearch} />
    </>
  );
}
