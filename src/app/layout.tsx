import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { PageViewTracker } from "@/app/components/PageViewTracker";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/app/components/CartDrawer";
import { StoreChrome } from "@/app/components/StoreChrome";
import { ThemeProvider } from "@/lib/theme-context";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getLocale, getMessages, getRequestPath, getUrlLocale } from "@/i18n/server";
import { intlLocales } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo/products";
import { alternatesFor, isStaticPage, localeUrl } from "@/lib/seo/locales";
import metaMessages from "@/i18n/messages/meta";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getMessages(metaMessages);
  // Canonical + hreflang for the static pages; product and collection layouts set their own
  const path = await getRequestPath();
  const urlLocale = await getUrlLocale();
  const indexable = isStaticPage(path);
  return {
    metadataBase: new URL(SITE_URL),
    ...(indexable ? { alternates: alternatesFor(path, urlLocale) } : {}),
    title: { default: t.title, template: "%s | eğrikuyu" },
    // Google Search Console verification: set GOOGLE_SITE_VERIFICATION on Vercel
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
    openGraph: {
      type: "website",
      siteName: "eğrikuyu",
      title: t.title,
      description: t.description,
      url: indexable ? localeUrl(path, urlLocale) : SITE_URL,
      locale: intlLocales[locale].replace("-", "_"),
    },
    description: t.description,
    keywords: t.keywords,
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
  };
}

// Pinch zoom stays enabled (accessibility)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        {/* Chrome heights, read by Header (spacer) and the homepage hero. See Header.tsx. */}
        <style>{`:root{--announcement-h:40px;--header-h:60px}@media (min-width:1024px){:root{--announcement-h:46px;--header-h:74px}}`}</style>
      </head>
      <body
        className={`${inter.variable} antialiased`}
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <LocaleProvider initialLocale={locale}>
        <ThemeProvider>
          <CartProvider>
            <StoreChrome>
              <Header />
            </StoreChrome>
            <main className="min-h-[70vh]">{children}</main>
            <StoreChrome>
              <Footer />
              <CartDrawer />
              <Analytics />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  name: "eğrikuyu",
                  url: "https://egrikuyu.com",
                  logo: "https://egrikuyu.com/egrikuyu.svg",
                  email: "info@egrikuyu.com",
                  sameAs: ["https://instagram.com/egriikuyu", "https://tiktok.com/@egrikuyu.com"],
                }),
              }}
            />
            <Suspense fallback={null}>
              <PageViewTracker />
            </Suspense>
            </StoreChrome>
          </CartProvider>
        </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
