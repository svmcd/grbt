"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug } from "@/lib/catalog";
import { getPriceForSlug } from "@/lib/pricing";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (state.items.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.items }),
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
        clearCart();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        "Checkout failed. Please check payment configuration and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push("/collection")}
            className="px-6 py-3 bg-white text-black font-medium tracking-wider uppercase text-sm hover:bg-white/90 transition-colors"
          >
            Browse Collection
          </button>
        </div>
      </div>
    );
  }

  const total = state.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen flex p-4 sm:p-8 flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-light mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-light mb-4">Order Summary</h2>
            <div className="space-y-4">
              {state.items.map((item, index) => (
                <div
                  key={`${item.slug}-${item.color}-${item.size}-${index}`}
                  className="flex gap-4 border-b border-white/10 pb-4"
                >
                  <div className="relative w-20 h-20 bg-white/5 rounded border border-white/10">
                    <img
                      src={item.image}
                      alt={item.city}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-light">{item.city}</h3>
                    <p className="text-white/70 text-sm">
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        {item.color}
                      </span>{" "}
                      •{" "}
                      <span className="font-bold text-[10px]">{item.size}</span>
                    </p>
                    <p className="text-white mt-1">€{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <h2 className="text-xl font-light mb-4">Payment</h2>
            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-light">Total</span>
                <span className="text-white text-2xl">€{total}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-white text-black font-medium tracking-wider uppercase text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Pay with Stripe"}
              </button>
              <p className="text-white/70 text-xs mt-2 text-center">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
