"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllShippingCountries, getShippingPrice } from "@/lib/shipping";
import { calculateBundlePricing, getTotalBundleDiscount } from "@/lib/bundle-pricing";
import { memleketSlugs } from "@/lib/catalog";

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
  const [isShippingOpen, setIsShippingOpen] = useState(true);

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
  const selectedShippingCountry = selectedCountry
    ? shippingCountries.find((c) => c.code === selectedCountry)
    : undefined;
  const shippingCost = selectedCountry ? getShippingPrice(selectedCountry) : 0;
  const itemsTotalCents = getSubtotal(); // Total in cents
  const itemsTotal = itemsTotalCents / 100; // Convert to euros for display

  // Calculate estimated delivery dates based on selected country
  const estimatedDays = selectedShippingCountry?.estimatedDays || "5 days";
  const days = parseInt(estimatedDays) || 5;
  const minDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days production
  const maxDate = new Date(Date.now() + (3 + days) * 24 * 60 * 60 * 1000); // 3 days + shipping
  const minDateStr = minDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
  });
  const maxDateStr = maxDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
  });

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
                      key={`${item.slug}-${item.color}-${item.size}-${item.productType}-${index}`}
                      className={`flex gap-3 border-b border-white/10 pb-3 transition-all duration-500 ${
                        state.justAdded?.slug === item.slug &&
                        state.justAdded?.color === item.color &&
                        state.justAdded?.size === item.size &&
                        state.justAdded?.productType === item.productType
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
                          <span className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] sm:text-[10px] font-bold rounded">
                            {item.productType === "phonecase" ? "Telefon Kılıfı" : item.productType === "hoodie" ? "Hoodie" : item.productType === "sweater" ? "Sweater" : "Tişört"}
                          </span>
                          {item.productType !== "phonecase" && (
                            <span className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded">
                              {item.color}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] sm:text-[10px] font-bold rounded">
                            {item.productType === "phonecase" ? item.phoneModel || item.size : item.size}
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
                            Hediye paketi dahil
                            {item.giftPackage.message && (
                              <div className="mt-1 italic">
                                "{item.giftPackage.message}"
                              </div>
                            )}
                          </div>
                        )}
                        {item.productType === "phonecase" && (
                          <div className="text-white/50 text-xs mt-1">
                            Ön sipariş • 2 hafta içinde üretilir
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1 sm:mt-2">
                          {(() => {
                            const bundlePricing = calculateBundlePricing(state.items);
                            const adjustedItem = bundlePricing.find(
                              (adj) =>
                                adj.item.slug === item.slug &&
                                adj.item.size === item.size &&
                                adj.item.productType === item.productType &&
                                adj.item.color === item.color &&
                                (item.productType !== "phonecase" || adj.item.phoneModel === item.phoneModel) &&
                                JSON.stringify(adj.item.personalization) === JSON.stringify(item.personalization) &&
                                JSON.stringify(adj.item.giftPackage) === JSON.stringify(item.giftPackage)
                            );
                            const displayPrice = adjustedItem?.adjustedPrice || item.price;
                            const hasBundleDiscount = adjustedItem?.bundleDiscount && adjustedItem.bundleDiscount > 0;
                            
                            // Calculate memleket discount for this item
                            const isMemleketItem = memleketSlugs.includes(item.slug);
                            let memleketDiscountCents = 0;
                            if (isMemleketItem) {
                              const memleketItems = state.items.filter((i) => memleketSlugs.includes(i.slug));
                              const memleketQuantity = memleketItems.reduce((sum, i) => sum + i.quantity, 0);
                              
                              // Count memleket items before this one
                              let memleketCountBefore = 0;
                              let foundCurrentMemleketItem = false;
                              for (const memleketItem of memleketItems) {
                                const isCurrentItem = 
                                  memleketItem.slug === item.slug &&
                                  memleketItem.color === item.color &&
                                  memleketItem.size === item.size &&
                                  memleketItem.productType === item.productType &&
                                  JSON.stringify(memleketItem.personalization) === JSON.stringify(item.personalization) &&
                                  JSON.stringify(memleketItem.giftPackage) === JSON.stringify(item.giftPackage);
                                
                                if (isCurrentItem && !foundCurrentMemleketItem) {
                                  foundCurrentMemleketItem = true;
                                  // Apply discount to first item based on total quantity
                                  if (memleketQuantity >= 3 && memleketCountBefore === 0) {
                                    // €10 discount for 3+ items, apply to first item only
                                    memleketDiscountCents = 1000; // €10 in cents
                                  } else if (memleketQuantity >= 2 && memleketQuantity < 3 && memleketCountBefore === 0) {
                                    // €5 discount for 2 items, apply to first item only
                                    memleketDiscountCents = 500; // €5 in cents
                                  }
                                  break;
                                }
                                
                                if (!foundCurrentMemleketItem) {
                                  memleketCountBefore += memleketItem.quantity;
                                }
                              }
                            }
                            
                            const totalDiscount = (hasBundleDiscount ? adjustedItem.bundleDiscount : 0) + memleketDiscountCents;
                            const hasDiscount = totalDiscount > 0;
                            
                            const totalItemPrice = item.price * item.quantity;
                            const totalItemPriceAfterDiscount = totalItemPrice - totalDiscount;
                            
                            return (
                              <div>
                                {hasDiscount ? (
                                  <div>
                                    <p className="text-white/50 text-xs line-through">
                                      €{(totalItemPrice / 100).toFixed(2)}
                                    </p>
                                    <p className="text-white text-sm sm:text-base">
                                      €{(totalItemPriceAfterDiscount / 100).toFixed(2)}
                                    </p>
                                    <div className="bg-black border border-white/10 rounded-none px-2 py-1 mt-1 inline-block">
                                      <p className="text-white/80 text-xs">
                                        -€{(totalDiscount / 100).toFixed(2)} indirim
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-white text-sm sm:text-base">
                                    €{(totalItemPrice / 100).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(
                                    item.slug,
                                    item.color,
                                    item.size,
                                    item.productType,
                                    item.quantity - 1,
                                    item.personalization,
                                    item.giftPackage
                                  );
                                } else {
                                  removeItem(
                                    item.slug,
                                    item.color,
                                    item.size,
                                    item.productType,
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
                                  item.productType,
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
                {/* Shipping Section */}
                <div className="bg-white/5 border border-white/10 rounded-none mb-4">
                  <button
                    onClick={() => setIsShippingOpen(!isShippingOpen)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="text-white font-medium text-sm">Kargo</div>
                    <div className="flex items-center gap-2">
                      {selectedCountry && (
                        <span className="text-white text-sm">
                          {itemsTotalCents >= 10000 ? (
                            "Ücretsiz"
                          ) : (
                            `€${shippingCost.toFixed(2)}`
                          )}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-white/60 transition-transform ${isShippingOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {isShippingOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">
                          Kargo Ülkesi
                        </label>
                        <select
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: "right 0.75rem center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
                        >
                          <option
                            value=""
                            disabled
                            className="bg-black text-white/50 py-2"
                          >
                            Kargo ülkesi seçin
                          </option>
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
                      {selectedCountry && (
                        <div className="text-white/60 text-xs">
                          {minDateStr} - {maxDateStr} arası teslim al
                        </div>
                      )}
                      {itemsTotalCents < 10000 && (
                        <div className="text-white/60 text-xs text-center">
                          €100 üzeri ücretsiz kargo
                        </div>
                      )}
                    </div>
                  )}
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
                  {(() => {
                    const bundlePricing = calculateBundlePricing(state.items);
                    const phoneCaseBundle = bundlePricing.find(adj => adj.bundleType === "phonecase-phonecase");
                    const shirtBundle = bundlePricing.find(adj => adj.bundleType === "phonecase-shirt");
                    const totalBundleDiscount = getTotalBundleDiscount(state.items);
                    
                    return (
                      <>
                        {phoneCaseBundle && phoneCaseBundle.bundleDiscount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/80 text-sm">
                              2 Telefon Kılıfı İndirimi
                            </span>
                            <span className="text-white">
                              -€{(phoneCaseBundle.bundleDiscount / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {shirtBundle && shirtBundle.bundleDiscount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/80 text-sm">
                              Telefon Kılıfı + Tişört İndirimi
                            </span>
                            <span className="text-white">
                              -€{(shirtBundle.bundleDiscount / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Toplam</span>
                      <span className="text-white text-xl font-medium">
                        €
                        {(
                          (getTotal() / 100) +
                          (itemsTotalCents >= 10000 ? 0 : shippingCost)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (state.items.length === 0 || isProcessing) return;
                      if (!selectedCountry) {
                        alert("Lütfen kargo ülkesi seçin");
                        return;
                      }
                      setIsProcessing(true);
                      try {
                        const bundleDiscount = getTotalBundleDiscount(state.items);
                        const memleketDiscount = getMemleketSavings() * 100; // Convert to cents
                        const totalDiscount = bundleDiscount + memleketDiscount;
                        
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
                          // Don't clear cart here - keep it in localStorage
                          // Cart will be cleared only after successful payment on success page
                          window.location.href = url;
                        }
                      } catch (e) {
                        console.error(e);
                        alert("Ödeme başarısız. Lütfen tekrar deneyin.");
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing || !selectedCountry}
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
                {selectedCountry && (
                  <p className="text-white/60 text-xs text-center mt-2">
                    Şimdi sipariş ver, {minDateStr}-{maxDateStr} arası teslim al
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
