"use client";

import { useState } from "react";

export default function TrackPage() {
  const [order, setOrder] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(`${order} için takip bilgileri burada görünecek.`);
  };

  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-2xl text-left">
        <h1 className="text-3xl font-light mb-6">Siparişimi Takip Et</h1>
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            className="flex-1 px-4 py-3 bg-transparent border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            placeholder="Sipariş numarası"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            required
          />
          <button
            className="px-6 py-3 bg-white text-black text-sm uppercase tracking-wide"
            type="submit"
          >
            Takip Et
          </button>
        </form>
        {result && <p className="text-muted/80 mt-4">{result}</p>}
      </div>
    </div>
  );
}
