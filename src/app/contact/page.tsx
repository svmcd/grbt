"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-2xl text-left">
        <h1 className="text-3xl font-light mb-6">İletişim</h1>
        {!sent ? (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <input
              className="w-full px-4 py-3 bg-transparent border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 rounded-none"
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="email"
              className="w-full px-4 py-3 bg-transparent border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 rounded-none"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <textarea
              className="w-full px-4 py-3 bg-transparent border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 min-h-[140px] rounded-none"
              placeholder="Mesaj"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-white text-black text-sm uppercase tracking-wide rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Gönderiliyor..." : "Gönder"}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="text-white text-sm mb-2">✓</div>
            <p className="text-white/80">
              Teşekkürler — mesajınız gönderildi ve en kısa sürede size dönüş
              yapacağız.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
