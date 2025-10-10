"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CollectionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to memleket collection by default
    router.replace("/collection/memleket");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/60">Yönlendiriliyor...</div>
    </div>
  );
}
