"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      setEmail("");
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="text-white text-sm mb-2">✓</div>
        <p className="text-white/70 text-sm">
          Teşekkürler! Bültenimize başarıyla abone oldunuz.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-white/90 text-sm mb-4 uppercase tracking-wide font-serif">
        Haberler ve Özel Teklifler
      </div>
      <p className="text-white/70 text-sm mb-4">
        Yeni koleksiyonlar ve özel indirimler hakkında ilk siz haberdar olun.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white text-base rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder-white/40"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-white text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 hover:bg-white/90 rounded-none disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            style={{ backgroundColor: "var(--white)", color: "var(--black)" }}
          >
            {isLoading ? "..." : "ABONE OL"}
          </button>
        </div>

        <p className="text-white/50 text-xs">
          E-posta adresinizi sadece bülten gönderimi için kullanırız.
          İstediğiniz zaman abonelikten çıkabilirsiniz.
        </p>
      </form>
    </div>
  );
}
