import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/app/components/CartDrawer";
import { ThemeProvider } from "@/lib/theme-context";
import { MobileFloatingElements } from "@/app/components/MobileFloatingElements";
import { DevToggle } from "@/app/components/DevToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "grbt. - Memleket Koleksiyonu",
  description:
    "Şehirlerin mizacı tişörtlerde. İstanbul'dan Trabzon'a, her parça bir hatıra, bir vapur sesi, bir çay kokusu.",
  keywords: [
    "tişört",
    "moda",
    "lüks",
    "grbt",
    "memleket",
    "türk şehirleri",
    "koleksiyon",
  ],
  icons: {
    icon: "/moon.svg",
    shortcut: "/moon.svg",
    apple: "/moon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="min-h-[70vh] pt-14">{children}</main>
              <Footer />
              <CartDrawer />
              <MobileFloatingElements />
              <DevToggle />
              <Analytics />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
