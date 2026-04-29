import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScroller from "@/components/layout/SmoothScroller";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import LoadingScreen from "@/components/layout/LoadingScreen";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import ThemeSplash from "@/components/layout/ThemeSplash";

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
    images: [{ url: "https://flenjure.com/cdn/shop/files/logo_color1_web.png?v=1742548877&width=2048", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleñjure",
    description: "Enjoy life! On ne vit qu'une fois.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
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
      <body className="min-h-full flex flex-col bg-[#fcfcfc] dark:bg-stone-900 text-stone-900 dark:text-stone-50 font-sans font-light tracking-[0.015em] selection:bg-stone-900 selection:text-white dark:selection:bg-white dark:selection:text-stone-900 transition-colors duration-700 ease-in-out">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSplash />
          <LoadingScreen />
          <SmoothScroller>
            <Navbar />
            <CartDrawer />
            <main className="flex-1 flex flex-col min-h-[calc(100vh-200px)]">{children}</main>
            <Footer />
          </SmoothScroller>
        </ThemeProvider>
      </body>
    </html>
  );
}
