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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-light mb-4">Siparişiniz Onaylandı</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Satın aldığınız için teşekkürler. Siparişiniz başarıyla işlendi ve
            kısa süre içinde kargoya verilecektir.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Order Summary */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-light mb-6 pb-4 border-b border-white/10">
              Sipariş Özeti
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-white/70">Sipariş Numarası</span>
                <span className="font-mono text-sm">
                  {orderDetails?.id?.slice(-8).toUpperCase() || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-white/70">Toplam Tutar</span>
                <span className="text-xl font-light">
                  €
                  {orderDetails?.amount_total
                    ? (orderDetails.amount_total / 100).toFixed(2)
                    : "0.00"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-white/70">Ödeme Durumu</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  Başarılı
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-white/70">Sipariş Tarihi</span>
                <span>
                  {orderDetails?.created
                    ? new Date(orderDetails.created * 1000).toLocaleDateString(
                        "tr-TR"
                      )
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {orderDetails.shipping_details && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <h2 className="text-2xl font-light mb-6 pb-4 border-b border-white/10">
                Teslimat Bilgileri
              </h2>

              <div className="space-y-4">
                <div>
                  <span className="text-white/70 text-sm block mb-1">
                    Ad Soyad
                  </span>
                  <span className="text-white">
                    {orderDetails.shipping_details.name}
                  </span>
                </div>

                <div>
                  <span className="text-white/70 text-sm block mb-1">
                    Adres
                  </span>
                  <div className="text-white">
                    <div>{orderDetails.shipping_details.address?.line1}</div>
                    {orderDetails.shipping_details.address?.line2 && (
                      <div>{orderDetails.shipping_details.address.line2}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-white/70 text-sm block mb-1">
                      Şehir
                    </span>
                    <span className="text-white">
                      {orderDetails.shipping_details.address?.city}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70 text-sm block mb-1">
                      Posta Kodu
                    </span>
                    <span className="text-white">
                      {orderDetails.shipping_details.address?.postal_code}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-white/70 text-sm block mb-1">Ülke</span>
                  <span className="text-white">
                    {orderDetails.shipping_details.address?.country}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-light mb-6 pb-4 border-b border-white/10">
            Sonraki Adımlar
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-light">1</span>
              </div>
              <h3 className="font-light mb-2">Sipariş Hazırlanıyor</h3>
              <p className="text-white/70 text-sm">
                Siparişiniz hazırlanıyor ve kalite kontrolünden geçiyor.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-light">2</span>
              </div>
              <h3 className="font-light mb-2">Kargoya Veriliyor</h3>
              <p className="text-white/70 text-sm">
                Siparişiniz kargoya verilecek ve takip numarası gönderilecek.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-light">3</span>
              </div>
              <h3 className="font-light mb-2">Teslimat</h3>
              <p className="text-white/70 text-sm">
                Siparişiniz adresinize teslim edilecek.
              </p>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-light mb-6 pb-4 border-b border-white/10">
            Destek
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-light mb-4">Siparişinizle İlgili Sorular</h3>
              <p className="text-white/70 mb-4">
                Siparişinizle ilgili herhangi bir sorunuz varsa veya teslimat
                bilgilerinizde hata olduğunu düşünüyorsanız, bizimle iletişime
                geçin.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-white/70 mr-3">E-posta:</span>
                  <span className="text-white">info@grbt.studio</span>
                </div>
                <div className="flex items-center">
                  <span className="text-white/70 mr-3">Referans:</span>
                  <span className="font-mono text-sm">
                    {orderDetails?.id?.slice(-8).toUpperCase() || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-light mb-4">Sık Sorulan Sorular</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white/70">Teslimat süresi:</span>
                  <span className="text-white ml-2">3-5 iş günü</span>
                </div>
                <div>
                  <span className="text-white/70">İade politikası:</span>
                  <span className="text-white ml-2">60 gün içinde</span>
                </div>
                <div>
                  <span className="text-white/70">Kargo takibi:</span>
                  <span className="text-white ml-2">
                    E-posta ile gönderilir
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Link
            href="/collection"
            className="inline-block px-8 py-4 bg-black text-white font-medium tracking-wider uppercase text-sm hover:bg-gray-200 transition-colors rounded-lg border border-black shadow-lg"
          >
            Alışverişe Devam Et
          </Link>

          <div className="pt-4">
            <Link
              href="/contact"
              className="text-white/70 hover:text-white underline text-sm"
            >
              İletişim
            </Link>
          </div>
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
