import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "grbt. - Coming Soon",
  description: "A new luxury clothing brand launching soon. Join the waitlist.",
  keywords: ["clothing", "fashion", "luxury", "grbt", "coming soon"],
  icons: {
    icon: "/moon.svg",
    shortcut: "/moon.svg",
    apple: "/moon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
