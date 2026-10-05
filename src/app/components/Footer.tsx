"use client";

import Link from "@/i18n/LocaleLink";
import { NewsletterSignup } from "./NewsletterSignup";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import chromeMessages from "@/i18n/messages/siteChrome";

// Trust row (three promises) followed by the dark footer:
// newsletter, more info links, about + contact details, bottom bar.
export function Footer() {
  const common = useMessages(commonMessages);
  const chrome = useMessages(chromeMessages);
  const t = chrome.footer;

  const links = [
    { href: "/contact", label: common.contact },
    { href: "/track", label: t.trackOrder },
    { href: "/shipping", label: t.shippingPolicy },
    { href: "/returns", label: t.returnPolicy },
    { href: "/support", label: t.support },
    { href: "/privacy", label: t.privacy },
    { href: "/terms", label: t.terms },
  ];

  return (
    <footer className="w-full bg-night text-paper">
      {/* Trust row */}
      <ul className="grid grid-cols-1 divide-y divide-night-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {chrome.trust.map((item) => (
          <li key={item.title} className="px-4 py-10 text-center md:px-8 md:py-14">
            <div className="sub text-paper">{item.title}</div>
            <p className="sub-xs mt-3 text-night-subdued">{item.text}</p>
          </li>
        ))}
      </ul>

      <div className="border-t border-night-line px-4 py-14 md:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Newsletter */}
          <div className="md:col-span-2 lg:col-span-1 lg:max-w-[460px]">
            <NewsletterSignup heading={t.newsletter} />
          </div>

          {/* More info */}
          <div>
            <h2 className="sub mb-5 text-paper">{t.moreInfo}</h2>
            <ul className="sub-xs flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-reveal text-paper">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h2 className="sub mb-5 text-paper">{t.about}</h2>
            <p className="sub-xs text-paper">{t.aboutText}</p>
            <address className="sub-xs mt-6 flex flex-col gap-1 not-italic text-night-subdued">
              <span>Vrijheidweg 22</span>
              <span>1521RR, Wormerveer, {t.country}</span>
              <a href="tel:+31628812182" className="link-reveal self-start hover:text-paper">
                +31 6 2881 2182
              </a>
              <a
                href="mailto:info@egrikuyu.com"
                className="link-reveal self-start normal-case hover:text-paper"
              >
                info@egrikuyu.com
              </a>
            </address>
            <div className="sub-xs mt-6 flex gap-6">
              <a
                href="https://instagram.com/egriikuyu"
                target="_blank"
                rel="noopener noreferrer"
                className="link-reveal text-paper"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com/@egrikuyu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-reveal text-paper"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-night-line px-4 py-4 md:px-8 lg:px-12">
        <LanguageSwitcher direction="up" align="left" className="text-paper" />
        <span className="sub-xs text-night-subdued">
          © {new Date().getFullYear()} eğrikuyu
        </span>
      </div>
    </footer>
  );
}
