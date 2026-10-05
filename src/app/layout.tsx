import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/app/components/CartDrawer";
import { ThemeProvider } from "@/lib/theme-context";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getLocale, getMessages } from "@/i18n/server";
import metaMessages from "@/i18n/messages/meta";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(metaMessages);
  return {
    metadataBase: new URL("https://egrikuyu.com"),
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
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
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="min-h-[70vh]">{children}</main>
              <Footer />
              <CartDrawer />
              <Analytics />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
