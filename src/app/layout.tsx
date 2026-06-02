import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Fleñjure",
    default: "Fleñjure | Enjoy life! On ne vit qu'une fois.",
  },
  description: "Quality. Experience. Fun. Fleñjure is a premium lifestyle and essentials brand built for those who know how to enjoy life.",
  openGraph: {
    title: "Fleñjure | Enjoy life! On ne vit qu'une fois.",
    description: "Quality. Experience. Fun. Fleñjure is a premium lifestyle brand.",
    url: "https://flenjure.com",
    siteName: "Fleñjure",
    images: [{ url: "https://flenjure.com/logo.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleñjure",
    description: "Enjoy life! On ne vit qu'une fois.",
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
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-[#fcfcfc] dark:bg-stone-900 text-stone-900 dark:text-stone-50 font-sans font-light tracking-[0.015em] selection:bg-stone-900 selection:text-white dark:selection:bg-white dark:selection:text-stone-900 transition-colors duration-700 ease-in-out"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
