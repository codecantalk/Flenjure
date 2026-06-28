import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CurrencyInit from "@/components/CurrencyInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flenjure.com"),
  title: {
    template: "%s | Fleñjure",
    default: "Fleñjure | Elevate Your Living",
  },
  description: "Inspired in 2021, Fleñjure is lifestyle brand headquartered in Atlanta, GA, USA. Fleñjure loosely translates to “elevate your living”:, experiences, clothing, dining, traveling, partying, dreaming—everything.",
  openGraph: {
    title: "Fleñjure | Elevate Your Living",
    description: "Inspired in 2021, Fleñjure is lifestyle brand headquartered in Atlanta, GA, USA. Fleñjure loosely translates to “elevate your living”:, experiences, clothing, dining, traveling, partying, dreaming—everything.",
    url: "https://flenjure.com",
    siteName: "Fleñjure",
    images: [{ url: "https://flenjure.com/logo.png?v=2", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleñjure",
    description: "Inspired in 2021, Fleñjure is lifestyle brand headquartered in Atlanta, GA, USA. Fleñjure loosely translates to “elevate your living”:, experiences, clothing, dining, traveling, partying, dreaming—everything.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Fleñjure",
    "url": "https://flenjure.com",
    "logo": "https://flenjure.com/logo.png",
    "description": "Inspired in 2021, Fleñjure is lifestyle brand headquartered in Atlanta, GA, USA. Fleñjure loosely translates to “elevate your living”:, experiences, clothing, dining, traveling, partying, dreaming—everything."
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body 
        className="min-h-full flex flex-col bg-[#fcfcfc] dark:bg-stone-900 text-stone-900 dark:text-stone-50 font-sans font-light tracking-[0.015em] selection:bg-stone-900 selection:text-white dark:selection:bg-white dark:selection:text-stone-900 transition-colors duration-700 ease-in-out"
        suppressHydrationWarning
      >
        <CurrencyInit />
        {children}
      </body>
    </html>
  );
}
