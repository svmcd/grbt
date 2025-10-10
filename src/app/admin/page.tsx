"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError("Geçersiz e-posta veya şifre");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex p-8 flex-col items-center justify-center">
      {/* Logo */}
      <div className="items-center flex flex-col gap-2 mb-8">
        <div className="flex justify-center">
          <Image
            src="/grbt.svg"
            alt="grbt."
            width={400}
            height={172}
            className="w-auto h-20 sm:h-24 lg:h-28"
            priority
          />
        </div>
        <p className="text-lg text-white font-light italic mb-2">
          Yönetici Erişimi
        </p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col gap-4 w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              required
              className="px-4 py-3 bg-transparent border border-muted/30 text-white placeholder-muted/50 focus:outline-none focus:border-white transition-all duration-300 text-center w-full"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              required
              className="px-4 py-3 bg-transparent border border-muted/30 text-white placeholder-muted/50 focus:outline-none focus:border-white transition-all duration-300 text-center w-full"
            />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="px-6 py-3 text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 whitespace-nowrap !bg-white disabled:cursor-not-allowed w-full"
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </form>
      </div>

      {/* Footer removed - global Footer handles this */}
    </div>
  );
}
