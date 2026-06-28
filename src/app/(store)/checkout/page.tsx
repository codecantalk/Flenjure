import { Suspense } from "react";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata = {
  title: "Checkout | Flenjure",
  description: "Secure checkout portal for Flenjure apparel and accessories.",
};

export default function CheckoutPage() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen selection:bg-stone-900 selection:text-white transition-colors duration-1000">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
          <div className="animate-pulse text-stone-400">Loading Checkout...</div>
        </div>
      }>
        <CheckoutClient />
      </Suspense>
    </div>
  );
}
