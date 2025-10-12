"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/order/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrderDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Sipariş detayları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-light mb-4">Sipariş Onaylandı</h1>
        <p className="text-white/70 mb-8">
          Satın aldığınız için teşekkürler! Siparişiniz başarıyla işlendi.
        </p>

        {orderDetails && (
          <div className="bg-white/5 border border-white/10 rounded-none p-6 mb-8">
            <h2 className="text-xl font-light mb-4">Sipariş Detayları</h2>
            <div className="space-y-2 text-left">
              <p>
                <span className="text-white/70">Sipariş ID:</span>{" "}
                {orderDetails.id}
              </p>
              <p>
                <span className="text-white/70">Toplam:</span> €
                {orderDetails.amount_total / 100}
              </p>
              <p>
                <span className="text-white/70">Durum:</span>{" "}
                {orderDetails.payment_status}
              </p>
            </div>

            {/* Customer Details */}
            {orderDetails.shipping_details && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-light mb-4">Teslimat Bilgileri</h3>
                <div className="space-y-2 text-left">
                  <p>
                    <span className="text-white/70">Ad Soyad:</span>{" "}
                    {orderDetails.shipping_details.name}
                  </p>
                  <p>
                    <span className="text-white/70">Adres:</span>{" "}
                    {orderDetails.shipping_details.address?.line1}
                    {orderDetails.shipping_details.address?.line2 &&
                      `, ${orderDetails.shipping_details.address.line2}`}
                  </p>
                  <p>
                    <span className="text-white/70">Şehir:</span>{" "}
                    {orderDetails.shipping_details.address?.city}
                  </p>
                  <p>
                    <span className="text-white/70">Posta Kodu:</span>{" "}
                    {orderDetails.shipping_details.address?.postal_code}
                  </p>
                  <p>
                    <span className="text-white/70">Ülke:</span>{" "}
                    {orderDetails.shipping_details.address?.country}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-lg font-light mb-4">İletişim</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Siparişinizle ilgili herhangi bir sorunuz varsa veya teslimat
                bilgilerinizde hata olduğunu düşünüyorsanız, lütfen bizimle
                iletişime geçin:
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-white/80">
                  <span className="text-white/70">E-posta:</span>{" "}
                  info@grbt.studio
                </p>
                <p className="text-white/80">
                  <span className="text-white/70">Sipariş Referansı:</span>{" "}
                  {orderDetails.id}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* <Link
            href="/track"
            className="block px-6 py-3 bg-white text-black font-medium tracking-wider uppercase text-sm hover:bg-white/90 transition-colors rounded-none"
            style={{
              backgroundColor: "var(--white)",
              color: "var(--black)",
            }}
          >
            Siparişinizi Takip Edin
          </Link> */}
          <Link
            href="/collection"
            className="block text-white/70 hover:text-white underline"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
