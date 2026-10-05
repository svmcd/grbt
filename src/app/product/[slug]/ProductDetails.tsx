"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { useFormatPrice, useMessages } from "@/i18n/LocaleProvider";
import productPageMessages from "@/i18n/messages/productPage";
import policyMessages from "@/i18n/messages/policies";

// "THE DETAILS" accordion under the buy box. Only content the shop already
// states: product copy from the catalog, specs, shipping and return policy.

const icons: Record<string, ReactNode> = {
  description: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7" />,
  origin: <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  city: <path d="M3 21h18M5 21V9l4-3v15M9 21V4l6 3v14M15 21V11l4 2v8" />,
  material: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7" />,
  shipping: <path d="M2 6h12v10H2zM14 9h4l3 3v4h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  returns: <path d="M4 8h12a4 4 0 0 1 0 8H8M4 8l4-4M4 8l4 4" />,
  donation: <path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z" />,
};

function Item({
  icon,
  title,
  defaultOpen,
  children,
}: {
  icon: keyof typeof icons;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-line" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-ink"
          aria-hidden
        >
          {icons[icon]}
        </svg>
        <span className="sub flex-1 text-ink">{title}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-ink transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          <path d="M5 9l7 7 7-7" />
        </svg>
      </summary>
      <div className="space-y-3 pb-6 pl-[38px] text-[13px] leading-relaxed text-ink">{children}</div>
    </details>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <span className="sub-xs text-subdued">{label}</span>
      <span className="sub-xs text-right text-ink">{value}</span>
    </div>
  );
}

export function ProductDetails({ product, isMemleket }: { product: Product; isMemleket: boolean }) {
  const t = useMessages(productPageMessages);
  const policies = useMessages(policyMessages);
  const price = useFormatPrice();

  return (
    <section className="mt-12">
      <h2 className="h-section mb-6 text-ink">{t.detailsTitle}</h2>
      <div className="border-t border-line">
        <Item icon="description" title={t.description} defaultOpen>
          <p>{product.description}</p>
        </Item>

        {product.designOrigin && (
          <Item icon="origin" title={t.designOrigin}>
            <p>{product.designOrigin}</p>
          </Item>
        )}

        {product.cityInfo && (
          <Item icon="city" title={t.cityAbout(product.city)}>
            <div>
              <p className="sub-xs mb-1 text-subdued">{t.cityGeneral}</p>
              <p>{product.cityInfo.general}</p>
            </div>
            <div>
              <p className="sub-xs mb-1 text-subdued">{t.cityCulture}</p>
              <p>{product.cityInfo.culture}</p>
            </div>
          </Item>
        )}

        <Item icon="material" title={t.materialTitle}>
          <div>
            <Fact label={t.specFabric} value={`${t.specFabricValue}, 240 g/m²`} />
            <Fact label={t.specCut} value={t.specCutValue} />
            <Fact label={t.specPrint} value={t.specPrintValue} />
            <Fact label={t.specProduction} value={t.specProductionValue} />
          </div>
        </Item>

        <Item icon="shipping" title={t.shippingTitle}>
          <p>{t.productionNotice}</p>
          <p>{policies.shipping.processingText}</p>
          <p>{policies.shipping.deliveryText}</p>
          <p>{t.freeShipping(price(100))}</p>
          <Link href="/shipping" className="sub-xs inline-block underline underline-offset-4">
            {t.shippingPolicyLink}
          </Link>
        </Item>

        <Item icon="returns" title={t.returnsTitle}>
          <p>{policies.returns.withdrawalText}</p>
          <p>{policies.returns.howText}</p>
          <Link href="/returns" className="sub-xs inline-block underline underline-offset-4">
            {t.returnsPolicyLink}
          </Link>
        </Item>

        {isMemleket && (
          <Item icon="donation" title={t.donationTitle}>
            <p>{product.donation.organization}</p>
            <p className="text-subdued">{t.donationTagline}</p>
            {product.donation.link && (
              <a
                href={product.donation.link}
                target="_blank"
                rel="noopener noreferrer"
                className="sub-xs inline-block underline underline-offset-4"
              >
                {t.donationVisit}
              </a>
            )}
          </Item>
        )}
      </div>
    </section>
  );
}
