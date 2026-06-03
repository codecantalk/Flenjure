import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Order Successful | Flenjure",
  description: "Thank you for your order.",
};

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const orderId = searchParams?.orderId || "FL-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 selection:bg-stone-900 selection:text-white">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="text-green-500 w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-2">Order Confirmed</h1>
        <p className="text-stone-500 mb-8">
          Thank you for shopping with Flenjure. Your order <strong className="text-stone-900">{orderId}</strong> has been received and is being processed.
        </p>

        <div className="w-full space-y-4">
          <Link 
            href="/shop" 
            className="w-full flex items-center justify-center py-4 bg-stone-900 text-white rounded-xl font-medium tracking-wide hover:bg-stone-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/" 
            className="w-full flex items-center justify-center py-4 bg-stone-100 text-stone-900 rounded-xl font-medium tracking-wide hover:bg-stone-200 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
