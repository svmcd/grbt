"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice, useLocale, useMessages } from "@/i18n/LocaleProvider";
import orderSuccessMessages from "@/i18n/messages/orderSuccess";
import commonMessages from "@/i18n/messages/common";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();
  const { intlLocale } = useLocale();
  const t = useMessages(orderSuccessMessages);
  const common = useMessages(commonMessages);
  const price = useFormatPrice();
  const formatEuro = (amount: number) => price(amount, 2);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/order/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrderDetails(data);
          setLoading(false);
          // Clear cart only after payment is confirmed
          if (data && data.payment_status === "paid") {
            clearCart();
          }
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-paper px-4 text-ink">
        <p className="sub">{t.loadingDetails}</p>
      </div>
    );
  }

  const orderRef = orderDetails?.id?.slice(-8).toUpperCase() || t.notAvailable;
  const steps = [
    { title: t.step1Title, text: t.step1Text },
    { title: t.step2Title, text: t.step2Text },
    { title: t.step3Title, text: t.step3Text },
  ];

  return (
    <div className="bg-paper text-ink">
      <div className="px-4 pb-20 pt-12 md:px-8 md:pt-16 lg:px-12 lg:pt-20">
        <div className="mx-auto w-full max-w-[1000px]">
          {/* Header */}
          <div className="mb-12 text-center md:mb-16">
            <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center border border-ink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                <path d="M4 12.5l5 5L20 6.5" strokeLinecap="square" />
              </svg>
            </div>
            <h1 className="h-section">{t.title}</h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[14px] leading-[1.7]">{t.intro}</p>
          </div>

          <div className={"mb-6 grid gap-6 " + (orderDetails?.shipping_details ? "md:grid-cols-2" : "")}>
            {/* Order summary */}
            <section className="border border-line p-6 md:p-8">
              <h2 className="sub mb-5 border-b border-line pb-4">{t.summaryTitle}</h2>
              <dl className="space-y-3 text-[14px]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-subdued">{t.orderNumber}</dt>
                  <dd>{orderRef}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-subdued">{t.totalAmount}</dt>
                  <dd>
                    {formatEuro(orderDetails?.amount_total ? orderDetails.amount_total / 100 : 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-subdued">{t.paymentStatus}</dt>
                  <dd className="sub-xs border border-ink px-2 py-1">{t.paymentSuccessful}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-subdued">{t.orderDate}</dt>
                  <dd>
                    {orderDetails?.created
                      ? new Date(orderDetails.created * 1000).toLocaleDateString(intlLocale)
                      : t.notAvailable}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Shipping information */}
            {orderDetails?.shipping_details && (
              <section className="border border-line p-6 md:p-8">
                <h2 className="sub mb-5 border-b border-line pb-4">{t.deliveryTitle}</h2>
                <dl className="space-y-4 text-[14px] leading-[1.5]">
                  <div>
                    <dt className="sub-xs mb-1 text-subdued">{t.fullName}</dt>
                    <dd>{orderDetails.shipping_details.name}</dd>
                  </div>
                  <div>
                    <dt className="sub-xs mb-1 text-subdued">{t.address}</dt>
                    <dd>
                      <div>{orderDetails.shipping_details.address?.line1}</div>
                      {orderDetails.shipping_details.address?.line2 && (
                        <div>{orderDetails.shipping_details.address.line2}</div>
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="sub-xs mb-1 text-subdued">{t.city}</dt>
                      <dd>{orderDetails.shipping_details.address?.city}</dd>
                    </div>
                    <div>
                      <dt className="sub-xs mb-1 text-subdued">{t.postalCode}</dt>
                      <dd>{orderDetails.shipping_details.address?.postal_code}</dd>
                    </div>
                  </div>
                  <div>
                    <dt className="sub-xs mb-1 text-subdued">{t.country}</dt>
                    <dd>{orderDetails.shipping_details.address?.country}</dd>
                  </div>
                </dl>
              </section>
            )}
          </div>

          {/* Next steps */}
          <section className="mb-6 border border-line p-6 md:p-8">
            <h2 className="sub mb-6 border-b border-line pb-4">{t.nextStepsTitle}</h2>
            <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
              {steps.map((step, i) => (
                <li key={i}>
                  <span className="mb-4 flex h-10 w-10 items-center justify-center border border-ink text-[13px]">
                    {i + 1}
                  </span>
                  <h3 className="sub mb-2">{step.title}</h3>
                  <p className="text-[14px] leading-[1.6]">{step.text}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Support */}
          <section className="mb-12 border border-line p-6 md:p-8">
            <h2 className="sub mb-6 border-b border-line pb-4">{t.supportTitle}</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="sub mb-3">{t.questionsTitle}</h3>
                <p className="mb-4 text-[14px] leading-[1.6]">{t.questionsText}</p>
                <dl className="space-y-1.5 text-[14px]">
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="text-subdued">{t.emailLabel}</dt>
                    <dd>
                      <a href="mailto:info@egrikuyu.com" className="underline underline-offset-4">
                        info@egrikuyu.com
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="text-subdued">{t.referenceLabel}</dt>
                    <dd>{orderRef}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="sub mb-3">{t.faqTitle}</h3>
                <dl className="space-y-1.5 text-[14px] leading-[1.6]">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-subdued">{t.deliveryTimeLabel}</dt>
                    <dd>{t.deliveryTimeValue}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-subdued">{t.returnPolicyLabel}</dt>
                    <dd>{t.returnPolicyValue}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-subdued">{t.trackingLabel}</dt>
                    <dd>{t.trackingValue}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col items-center gap-5">
            <Link href="/collection" className="btn btn-ink w-full sm:w-auto sm:min-w-[260px]">
              {t.continueShopping}
            </Link>
            <Link href="/contact" className="sub-xs link-reveal">
              {common.contact}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  const common = useMessages(commonMessages);
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-paper px-4 text-ink">
          <p className="sub">{common.loading}</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
