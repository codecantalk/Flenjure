import SmoothScroller from "@/components/layout/SmoothScroller";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import LoadingScreen from "@/components/layout/LoadingScreen";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="flenjure-theme">
      <LoadingScreen />
      <SmoothScroller>
        <Navbar />
        <CartDrawer />
        <main className="flex-1 flex flex-col min-h-[calc(100vh-200px)]">{children}</main>
        <Footer />
      </SmoothScroller>
    </ThemeProvider>
  );
}
