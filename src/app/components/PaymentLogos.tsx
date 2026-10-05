"use client";

import Image from "next/image";
import { useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";

// The payment methods Stripe Checkout offers (src/app/api/checkout/route.ts: card, paypal,
// bancontact, ideal, klarna; Apple Pay comes with card), as their brand logos.
// The SVGs in public/payment-logos come unchanged from npm packages (scripts/payment-logos.mjs).
// `fill`: the logo already is a badge with its own background, so it fills the frame.
const LOGOS = [
  { file: "visa", name: "Visa", fill: false },
  { file: "mastercard", name: "Mastercard", fill: false },
  { file: "amex", name: "American Express", fill: false },
  { file: "paypal", name: "PayPal", fill: false },
  { file: "apple-pay", name: "Apple Pay", fill: false },
  { file: "ideal", name: "iDEAL", fill: true },
  { file: "bancontact", name: "Bancontact", fill: true },
  { file: "klarna", name: "Klarna", fill: true },
] as const;

export function PaymentLogos({ className = "" }: { className?: string }) {
  const common = useMessages(commonMessages);
  return (
    <ul aria-label={common.acceptedPayments} className={"flex flex-wrap gap-[3px] " + className}>
      {LOGOS.map((logo) => (
        <li
          key={logo.file}
          className={
            "flex h-6 w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-line bg-paper " +
            (logo.fill ? "" : "px-[3px] py-[3px]")
          }
        >
          <Image
            src={`/payment-logos/${logo.file}.svg`}
            alt={logo.name}
            title={logo.name}
            width={38}
            height={24}
            className={"h-full w-full " + (logo.fill ? "object-cover" : "object-contain")}
          />
        </li>
      ))}
    </ul>
  );
}
