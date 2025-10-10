"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllShippingCountries, getShippingPrice } from "@/lib/shipping";

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
    clearCart,
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("NL");
  const shippingCountries = getAllShippingCountries();

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

  // Calculate shipping cost
  const selectedShippingCountry = shippingCountries.find(
    (c) => c.code === selectedCountry
  );
  const shippingCost = getShippingPrice(selectedCountry);
  const itemsTotal = getSubtotal();

  useEffect(() => {
    if (state.justAdded) {
      const timer = setTimeout(() => clearJustAdded(), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.justAdded, clearJustAdded]);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l border-white/10 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-light">Sepet ({getItemCount()})</h2>

              {/* Pre-order Notice */}
              <div className="bg-white/5 border border-white/10 rounded-none p-3 mt-4">
                <div className="text-center">
                  <div className="text-white/60 text-xs mb-1 uppercase tracking-wider font-bold">
                    ÖN SİPARİŞ | PRE ORDER
                  </div>
                  <div className="text-white/80 text-xs">
                    Siparişleriniz{" "}
                    <span className="text-white font-medium">
                      {new Date(
                        Date.now() + 14 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>{" "}
                    tarihinde kargoya verilir.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="text-center text-white/70 mt-8">
                  <p>Sepetiniz boş</p>
                  <Link
                    href="/collection"
                    className="text-white underline mt-2 block"
                    onClick={closeCart}
                  >
                    Koleksiyonu Keşfet
                  </Link>
                  <button
                    onClick={closeCart}
                    className="mt-4 w-full py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-none text-white hover:bg-white/20 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.items.map((item, index) => (
                    <div
                      key={`${item.slug}-${item.color}-${item.size}-${index}`}
                      className={`flex gap-3 border-b border-white/10 pb-3 transition-all duration-500 ${
                        state.justAdded?.slug === item.slug &&
                        state.justAdded?.color === item.color &&
                        state.justAdded?.size === item.size
                          ? "rounded-none p-2 -m-2"
                          : ""
                      }`}
                    >
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded border border-white/10">
                        <Image
                          src={item.image}
                          alt={item.city}
                          fill
                          className="object-contain p-1 sm:p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-light text-sm sm:text-base">
                          {item.city}
                        </h3>
                        <div className="flex gap-1 mt-1">
                          <span className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded">
                            {item.color}
                          </span>
                          <span className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] sm:text-[10px] font-bold rounded">
                            {item.size}
                          </span>
                          {item.personalization && (
                            <span className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] sm:text-[10px] font-bold rounded">
                              {item.personalization.method === "printed"
                                ? "Baskı"
                                : "İşleme"}
                            </span>
                          )}
                        </div>
                        {item.personalization && (
                          <div className="text-white/50 text-xs mt-1">
                            "{item.personalization.text}" -{" "}
                            {item.personalization.placement}
                            <br />
                            Font: {item.personalization.font} • Renk:{" "}
                            {item.personalization.color}
                          </div>
                        )}
                        {item.giftPackage && (
                          <div className="text-white/50 text-xs mt-1">
                            🎁 Hediye paketi dahil
                            {item.giftPackage.message && (
                              <div className="mt-1 italic">
                                "{item.giftPackage.message}"
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1 sm:mt-2">
                          <p className="text-white text-sm sm:text-base">
                            €{item.price}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(
                                    item.slug,
                                    item.color,
                                    item.size,
                                    item.quantity - 1,
                                    item.personalization,
                                    item.giftPackage
                                  );
                                } else {
                                  removeItem(
                                    item.slug,
                                    item.color,
                                    item.size,
                                    item.personalization,
                                    item.giftPackage
                                  );
                                }
                              }}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-none bg-white/10 text-white text-xs sm:text-sm flex items-center justify-center hover:bg-white/20"
                            >
                              −
                            </button>
                            <span className="text-white text-xs sm:text-sm w-5 sm:w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                updateQuantity(
                                  item.slug,
                                  item.color,
                                  item.size,
                                  item.quantity + 1,
                                  item.personalization,
                                  item.giftPackage
                                );
                              }}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-none bg-white/10 text-white text-xs sm:text-sm flex items-center justify-center hover:bg-white/20"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {state.items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-white/10 bg-black backdrop-blur-sm">
                <div className="mb-4">
                  <label className="block text-white/80 text-sm mb-2">
                    Kargo Ülkesi
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    {shippingCountries.map((country) => (
                      <option
                        key={country.code}
                        value={country.code}
                        className="bg-black text-white py-2"
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Ara Toplam</span>
                    <span className="text-white">€{itemsTotal.toFixed(2)}</span>
                  </div>
                  {getMemleketSavings() > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">
                        Anne Baba Memleketi İndirimi
                      </span>
                      <span className="text-white">
                        -€{getMemleketSavings().toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Kargo</span>
                    <span className="text-white">
                      {itemsTotal >= 100 ? (
                        <span className="text-white">Ücretsiz</span>
                      ) : (
                        `€${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {itemsTotal < 100 && (
                    <div className="text-white/60 text-xs text-center">
                      €100 üzeri ücretsiz kargo
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Toplam</span>
                      <span className="text-white text-xl font-medium">
                        €
                        {(
                          itemsTotal -
                          getMemleketSavings() +
                          (itemsTotal >= 100 ? 0 : shippingCost)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (state.items.length === 0 || isProcessing) return;
                      setIsProcessing(true);
                      try {
                        const resp = await fetch("/api/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            items: state.items,
                            shippingCountry: selectedCountry,
                          }),
                        });
                        const contentType =
                          resp.headers.get("content-type") || "";
                        if (!contentType.includes("application/json")) {
                          const text = await resp.text();
                          throw new Error(text.slice(0, 200));
                        }
                        const { url, error } = await resp.json();
                        if (error) throw new Error(error);
                        if (url) {
                          clearCart();
                          window.location.href = url;
                        }
                      } catch (e) {
                        console.error(e);
                        alert("Ödeme başarısız. Lütfen tekrar deneyin.");
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-white text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 hover:bg-white/90 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "İşleniyor..." : "Ödeme"}
                  </button>
                  <button
                    onClick={closeCart}
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-none flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
