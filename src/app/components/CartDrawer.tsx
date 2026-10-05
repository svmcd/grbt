"use client";

import { useEffect, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllShippingCountries, getShippingPrice, getCountryName } from "@/lib/shipping";
import { memleketSlugs } from "@/lib/catalog";
import { useFormatPrice, useLocale, useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import cartMessages from "@/i18n/messages/cart";

// Free shipping threshold, in cents, measured on the subtotal before discounts
const FREE_SHIPPING_CENTS = 10000;

const sameLine = (a: CartItem, b: CartItem) =>
  a.slug === b.slug &&
  a.color === b.color &&
  a.size === b.size &&
  a.productType === b.productType &&
  JSON.stringify(a.personalization) === JSON.stringify(b.personalization) &&
  JSON.stringify(a.giftPackage) === JSON.stringify(b.giftPackage);

// Memleket family discount shown on a line: the whole discount sits on the first
// Memleket line in the cart (2 items: €5, 3+ items: €10). Returns cents.
function memleketLineDiscountCents(item: CartItem, items: CartItem[]): number {
  if (!memleketSlugs.includes(item.slug)) return 0;
  const memleketItems = items.filter((i) => memleketSlugs.includes(i.slug));
  const memleketQuantity = memleketItems.reduce((sum, i) => sum + i.quantity, 0);
  const first = memleketItems[0];
  if (!first || !sameLine(first, item)) return 0;
  if (memleketQuantity >= 3) return 1000;
  if (memleketQuantity >= 2) return 500;
  return 0;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <path d="M4 4l16 16M20 4L4 20" strokeLinecap="square" />
    </svg>
  );
}

export function CartDrawer() {
  const {
    state,
    removeItem,
    updateQuantity,
    closeCart,
    getSubtotal,
    getTotal,
    getItemCount,
    getMemleketSavings,
    clearJustAdded,
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const shippingCountries = getAllShippingCountries();
  const { locale, intlLocale } = useLocale();
  const common = useMessages(commonMessages);
  const t = useMessages(cartMessages);
  const price = useFormatPrice();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (state.isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Store scroll position for restoration
      document.body.setAttribute("data-scroll-y", scrollY.toString());
    } else {
      const scrollY = document.body.getAttribute("data-scroll-y");
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.top = "unset";
      document.body.style.width = "unset";

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
        document.body.removeAttribute("data-scroll-y");
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.top = "unset";
      document.body.style.width = "unset";
    };
  }, [state.isOpen]);

  // Close with Escape
  useEffect(() => {
    if (!state.isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.isOpen, closeCart]);

  // Calculate shipping cost
  const selectedShippingCountry = selectedCountry
    ? shippingCountries.find((c) => c.code === selectedCountry)
    : undefined;
  const shippingCost = selectedCountry ? getShippingPrice(selectedCountry) : 0;
  const itemsTotalCents = getSubtotal(); // Total in cents
  const itemsTotal = itemsTotalCents / 100; // Convert to euros for display
  const qualifiesForFreeShipping = itemsTotalCents >= FREE_SHIPPING_CENTS;
  const freeShippingProgress = Math.min(1, itemsTotalCents / FREE_SHIPPING_CENTS);
  const memleketSavings = getMemleketSavings();

  // Calculate estimated delivery dates based on selected country
  const estimatedDays = selectedShippingCountry?.estimatedDays || "5 days";
  const days = parseInt(estimatedDays) || 5;
  const minDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days production
  const maxDate = new Date(Date.now() + (3 + days) * 24 * 60 * 60 * 1000); // 3 days + shipping
  const minDateStr = minDate.toLocaleDateString(intlLocale, {
    day: "2-digit",
    month: "2-digit",
  });
  const maxDateStr = maxDate.toLocaleDateString(intlLocale, {
    day: "2-digit",
    month: "2-digit",
  });

  useEffect(() => {
    if (state.justAdded) {
      const timer = setTimeout(() => clearJustAdded(), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.justAdded, clearJustAdded]);

  const handleCheckout = async () => {
    if (state.items.length === 0 || isProcessing) return;
    if (!selectedCountry) {
      alert(t.alertSelectCountry);
      return;
    }
    setIsProcessing(true);
    try {
      const totalDiscount = getMemleketSavings() * 100; // Convert to cents

      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items,
          shippingCountry: selectedCountry,
          itemsTotal: (itemsTotalCents - totalDiscount) / 100, // Convert to euros
          itemsSubtotal: itemsTotalCents / 100, // Convert to euros
          discount: totalDiscount / 100, // Total discount in euros
          shippingCost: itemsTotalCents >= 10000 ? 0 : shippingCost, // €100 in cents
          locale,
        }),
      });
      const contentType = resp.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await resp.text();
        throw new Error(text.slice(0, 200));
      }
      const { url, error } = await resp.json();
      if (error) throw new Error(error);
      if (url) {
        // Don't clear cart here - keep it in localStorage
        // Cart will be cleared only after successful payment on success page
        window.location.href = url;
      }
    } catch (e) {
      console.error(e);
      alert(t.paymentFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  const changeQuantity = (item: CartItem, quantity: number) => {
    if (quantity < 1) {
      removeItem(item.slug, item.color, item.size, item.productType, item.personalization, item.giftPackage);
      return;
    }
    updateQuantity(
      item.slug,
      item.color,
      item.size,
      item.productType,
      quantity,
      item.personalization,
      item.giftPackage
    );
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-night/50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t.title(getItemCount())}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.35 }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full flex-col bg-paper text-ink sm:w-[420px]"
          >
            {/* Header */}
            <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-line px-6">
              <h2 className="sub">{t.title(getItemCount())}</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label={common.close}
                className="-mr-2 flex h-10 w-10 items-center justify-center text-ink"
              >
                <CloseIcon />
              </button>
            </div>

            {state.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="h-section mb-8 !text-[32px]">{t.empty}</p>
                <Link href="/collection" onClick={closeCart} className="btn btn-ink">
                  {t.continueShopping}
                </Link>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="shrink-0 border-b border-line px-6 py-4">
                  <p className="sub-xs text-center">
                    {qualifiesForFreeShipping
                      ? t.freeShippingReached
                      : t.freeShippingRemaining(price((FREE_SHIPPING_CENTS - itemsTotalCents) / 100, 2))}
                  </p>
                  <div className="mt-3 h-[2px] w-full bg-line" aria-hidden="true">
                    <div
                      className="h-full bg-ink transition-[width] duration-500"
                      style={{ width: `${freeShippingProgress * 100}%` }}
                    />
                  </div>
                </div>

                {/* Line items */}
                <div className="flex-1 overflow-y-auto px-6">
                  <ul>
                    {state.items.map((item, index) => {
                      const lineDiscount = memleketLineDiscountCents(item, state.items);
                      const lineTotal = item.price * item.quantity;
                      return (
                        <li
                          key={`${item.slug}-${item.color}-${item.size}-${item.productType}-${index}`}
                          className="flex gap-4 border-b border-line py-6 last:border-b-0"
                        >
                          <div className="relative h-[96px] w-[96px] shrink-0 border border-line bg-paper">
                            <Image
                              src={item.image}
                              alt={item.city}
                              fill
                              sizes="96px"
                              className="object-contain p-1.5"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="sub break-words">{item.city}</h3>
                              <div className="shrink-0 text-right">
                                {lineDiscount > 0 ? (
                                  <>
                                    <p className="sub-xs text-sale">
                                      {price((lineTotal - lineDiscount) / 100, 2)}
                                    </p>
                                    <p className="sub-xs text-subdued line-through">
                                      {price(lineTotal / 100, 2)}
                                    </p>
                                  </>
                                ) : (
                                  <p className="sub-xs text-subdued">{price(lineTotal / 100, 2)}</p>
                                )}
                              </div>
                            </div>

                            <div className="mt-1.5 space-y-0.5 text-[12px] leading-[1.5] tracking-[0.04em] text-subdued">
                              <p className="uppercase">
                                {common.productTypes[item.productType] ?? common.productTypes.tshirt}
                                {" / "}
                                {common.colors[item.color] ?? item.color}
                                {" / "}
                                {item.size}
                              </p>
                              {item.personalization && (
                                <>
                                  <p>
                                    <span className="uppercase">
                                      {item.personalization.method === "printed"
                                        ? common.personalization.printed
                                        : common.personalization.embroidered}
                                    </span>
                                    {": "}&ldquo;{item.personalization.text}&rdquo; ({item.personalization.placement})
                                  </p>
                                  <p>
                                    {t.fontLabel}: {t.fonts[item.personalization.font] ?? item.personalization.font}
                                    {" / "}
                                    {common.color}: {item.personalization.color}
                                  </p>
                                </>
                              )}
                              {item.giftPackage && (
                                <>
                                  <p className="uppercase">{t.giftIncluded}</p>
                                  {item.giftPackage.message && (
                                    <p className="italic">&ldquo;{item.giftPackage.message}&rdquo;</p>
                                  )}
                                </>
                              )}
                              {lineDiscount > 0 && (
                                <p className="uppercase text-sale">
                                  {t.discountOff(price(lineDiscount / 100, 2))}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex items-center gap-4">
                              <div className="flex h-[38px] items-center border border-line">
                                <button
                                  type="button"
                                  onClick={() => changeQuantity(item, item.quantity - 1)}
                                  aria-label={t.decreaseQuantity}
                                  className="flex h-full w-9 items-center justify-center text-ink"
                                >
                                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                                    <path d="M0 5h10" stroke="currentColor" strokeWidth="1.4" />
                                  </svg>
                                </button>
                                <span className="sub-xs w-7 text-center tabular-nums" aria-live="polite">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => changeQuantity(item, item.quantity + 1)}
                                  aria-label={t.increaseQuantity}
                                  className="flex h-full w-9 items-center justify-center text-ink"
                                >
                                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                                    <path d="M0 5h10M5 0v10" stroke="currentColor" strokeWidth="1.4" />
                                  </svg>
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    item.slug,
                                    item.color,
                                    item.size,
                                    item.productType,
                                    item.personalization,
                                    item.giftPackage
                                  )
                                }
                                className="sub-xs text-subdued underline underline-offset-4 hover:text-ink"
                              >
                                {t.remove}
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-line px-6 pb-6 pt-5">
                  <label htmlFor="cart-shipping-country" className="sub-xs mb-2 block">
                    {t.shippingCountry}
                  </label>
                  <select
                    id="cart-shipping-country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    required
                    className="storefront-input cursor-pointer appearance-none focus:outline-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231c1c1c' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 12px center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "18px 18px",
                      paddingTop: 0,
                      paddingBottom: 0,
                      paddingRight: 40,
                    }}
                  >
                    <option value="" disabled>
                      {t.selectCountry}
                    </option>
                    {shippingCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {getCountryName(country.code, locale)}
                      </option>
                    ))}
                  </select>

                  <dl className="mt-5 space-y-1.5">
                    <div className="sub-xs flex justify-between">
                      <dt>{common.subtotal}</dt>
                      <dd>{price(itemsTotal, 2)}</dd>
                    </div>
                    {memleketSavings > 0 && (
                      <div className="sub-xs flex justify-between gap-4">
                        <dt>{t.memleketDiscount}</dt>
                        <dd className="shrink-0 text-sale">-{price(memleketSavings, 2)}</dd>
                      </div>
                    )}
                    {(selectedCountry || qualifiesForFreeShipping) && (
                      <div className="sub-xs flex justify-between">
                        <dt>{common.shipping}</dt>
                        <dd>{qualifiesForFreeShipping ? common.free : price(shippingCost, 2)}</dd>
                      </div>
                    )}
                    <div className="sub flex justify-between border-t border-line pt-3 !mt-3">
                      <dt>{common.total}</dt>
                      <dd>
                        {price(getTotal() / 100 + (qualifiesForFreeShipping ? 0 : shippingCost), 2)}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isProcessing || !selectedCountry}
                    className="btn btn-ink mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
                  >
                    {isProcessing ? t.processing : t.checkout}
                  </button>
                  <p className="mt-3 text-center text-[12px] leading-[1.5] tracking-[0.04em] text-subdued">
                    {selectedCountry ? t.orderNow(minDateStr, maxDateStr) : t.alertSelectCountry}
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
