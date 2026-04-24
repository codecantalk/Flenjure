import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata = {
  title: "Checkout | Flenjure",
  description: "Secure checkout portal for Flenjure apparel and accessories.",
};

export default function CheckoutPage() {
  return (
    <div className="bg-stone-50 min-h-screen selection:bg-stone-900 selection:text-white">
      <CheckoutClient />
    </div>
  );
}
