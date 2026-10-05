"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { useFormatPrice, useLocale, useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import checkoutMessages from "@/i18n/messages/checkout";

export default function CheckoutPage() {
  const { state } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const { locale } = useLocale();
  const common = useMessages(commonMessages);
  const t = useMessages(checkoutMessages);
  const price = useFormatPrice();
  // The cart is read from localStorage, so render it only after mount to avoid a hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleCheckout = async () => {
    if (state.items.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.items, locale }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text.slice(0, 200));
      }
      const { url, error } = await response.json();
      if (error) {
        throw new Error(error);
      }
      if (url) {
        // Don't clear cart here - keep it in localStorage
        // Cart will be cleared only after successful payment on success page
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(t.checkoutFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-[60vh] bg-paper" />;
  }

  if (state.items.length === 0) {
    return (
      <div className="bg-paper px-4 py-24 text-center text-ink md:px-8 md:py-32 lg:px-12">
        <h1 className="h-section">{t.empty}</h1>
        <button onClick={() => router.push("/collection")} className="btn btn-ink mt-8">
          {t.browse}
        </button>
      </div>
    );
  }

  // Cart prices are stored in cents
  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0) / 100;

  return (
    <div className="bg-paper text-ink">
      <div className="px-4 pb-20 pt-12 md:px-8 md:pt-16 lg:px-12 lg:pt-20">
        <div className="mx-auto w-full max-w-[1100px]">
          <h1 className="h-section mb-10 md:mb-14">{t.title}</h1>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_380px] md:gap-12">
            {/* Order summary */}
            <section>
              <h2 className="sub border-b border-line pb-4">{t.orderSummary}</h2>
              <ul>
                {state.items.map((item, index) => (
                  <li
                    key={`${item.slug}-${item.color}-${item.size}-${index}`}
                    className="flex gap-4 border-b border-line py-5"
                  >
                    <div className="relative h-20 w-20 shrink-0 border border-line bg-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.city} className="h-full w-full object-contain p-1.5" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="sub break-words">{item.city}</h3>
                        <p className="sub-xs mt-1 text-subdued">
                          {common.colors[item.color] ?? item.color} / {item.size}
                          {item.quantity > 1 && ` / ${common.quantity}: ${item.quantity}`}
                        </p>
                      </div>
                      <p className="sub-xs shrink-0 text-subdued">{price((item.price * item.quantity) / 100)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Payment */}
            <section>
              <h2 className="sub border-b border-line pb-4">{t.payment}</h2>
              <div className="mt-5 border border-line p-6">
                <div className="sub flex items-center justify-between">
                  <span>{common.total}</span>
                  <span>{price(total)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="btn btn-ink mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? t.processing : t.payWithStripe}
                </button>
                <p className="mt-3 text-center text-[12px] leading-[1.5] tracking-[0.04em] text-subdued">
                  {t.securePayment}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
