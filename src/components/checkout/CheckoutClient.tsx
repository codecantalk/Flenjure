"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info, ShoppingBag, Loader2 } from "lucide-react";
import clsx from "clsx";
import { createOrUpdateCartSession } from "@/app/admin/actions";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const cartTotal = items.reduce((total, item) => {
    const priceNum = parseFloat(item.price.replace("$", ""));
    return total + priceNum * item.quantity;
  }, 0);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // CRM Abandoned Cart tracking
  useEffect(() => {
    if (!email || !email.includes("@")) return;
    const timeout = setTimeout(() => {
      createOrUpdateCartSession({
        email,
        whatsapp_number: phone,
        items: items.map((i) => ({
          id: i.id,
          title: i.name,
          quantity: i.quantity,
          price: parseFloat(i.price.replace("$", "")),
        })),
        is_recovered: false,
      }).catch(console.error);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [email, phone, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      return alert("Please fill in all required shipping fields");
    }

    setIsProcessing(true);

    // Mark CRM session as recovered optimistically
    try {
      await createOrUpdateCartSession({
        email,
        items: [],
        is_recovered: true,
      });
    } catch (e) {
      console.error("CRM tracking failed, proceeding to payment:", e);
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: email,
        shipping: {
          name: `${firstName} ${lastName}`,
          address: {
            line1: address,
            city,
            state,
            postal_code: zip,
            country: "US",
          },
        },
      },
    });

    if (error) {
      alert(error.message);
      setIsProcessing(false);
    } else {
      clearCart();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans bg-white dark:bg-[#0a0a0a] selection:bg-stone-900 selection:text-white dark:selection:bg-white dark:selection:text-stone-900 transition-colors duration-700">
      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden w-full bg-[#fcfcfc] dark:bg-[#111] border-b border-[#e6e6e6] dark:border-stone-800 py-4 px-6 sticky top-0 z-40 transition-colors duration-700">
        <button
          onClick={() => setShowOrderSummary(!showOrderSummary)}
          className="w-full flex justify-between items-center text-[14px] text-stone-900 dark:text-white"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span>
              {showOrderSummary ? "Hide order summary" : "Show order summary"}
            </span>
            <ChevronDown
              size={14}
              className={clsx(
                "transition-transform duration-300",
                showOrderSummary && "rotate-180"
              )}
            />
          </div>
          <span className="font-semibold text-lg">
            ${cartTotal.toFixed(2)}
          </span>
        </button>

        <AnimatePresence>
          {showOrderSummary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 pb-2 flex flex-col gap-6">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-white dark:bg-stone-900 border border-[#e6e6e6] dark:border-stone-800 rounded-[6px] overflow-hidden flex-shrink-0 transition-colors duration-700">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                      <div className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-[rgba(114,114,114,0.9)] dark:bg-stone-700 rounded-full flex items-center justify-center text-[11px] text-white font-medium z-10">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-stone-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-[12px] text-[#737373] dark:text-stone-400">
                        {item.size}
                      </p>
                    </div>
                    <span className="text-[14px] font-medium text-stone-900 dark:text-white">
                      $
                      {(
                        parseFloat(item.price.replace("$", "")) * item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-[#e6e6e6] dark:border-stone-800 pt-4 mt-2">
                  <div className="flex justify-between text-[14px] mb-2">
                    <span className="text-[#737373] dark:text-stone-400">Subtotal</span>
                    <span className="font-medium text-stone-900 dark:text-white">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#737373] dark:text-stone-400">Shipping</span>
                    <span className="text-[#737373] dark:text-stone-400">
                      Calculated at next step
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LEFT: Checkout Information */}
      <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-end pt-24 lg:pt-32 pb-24 px-6 lg:pl-12 lg:pr-[5%] bg-white dark:bg-[#0a0a0a] border-r border-[#e6e6e6] dark:border-stone-800 transition-colors duration-700">
        <div className="w-full max-w-[560px] flex flex-col">
          <form className="flex flex-col gap-9" onSubmit={handleSubmit}>
            {/* Contact */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end mb-1">
                <h2 className="text-xl font-medium text-stone-900 dark:text-white tracking-tight">
                  Contact
                </h2>
                <Link
                  href="/account"
                  className="text-[13px] text-stone-900 dark:text-stone-300 underline hover:no-underline font-normal"
                >
                  Sign in
                </Link>
              </div>

              {/* Express Checkout (Apple Pay / Google Pay) */}
              <div className="mb-4">
                <ExpressCheckoutElement onConfirm={() => setIsProcessing(true)} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] flex-1 bg-[#e6e6e6] dark:bg-stone-800"></div>
                <span className="text-[12px] text-[#737373]">OR</span>
                <div className="h-[1px] flex-1 bg-[#e6e6e6] dark:bg-stone-800"></div>
              </div>

              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white outline-none text-[14px] font-normal transition-all placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111] shadow-sm"
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="news"
                  className="w-[18px] h-[18px] rounded-[4px] border-[#d9d9d9] dark:border-stone-800 checked:bg-stone-900 dark:checked:bg-white checked:border-stone-900 cursor-pointer"
                  defaultChecked
                />
                <label
                  htmlFor="news"
                  className="text-[14px] text-stone-900 dark:text-stone-300 cursor-pointer"
                >
                  Email me with news and offers
                </label>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-medium text-stone-900 dark:text-white tracking-tight mb-1">
                Delivery
              </h2>
              <div className="relative">
                <select className="w-full p-[14px] pt-5 border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-[#111] text-stone-900 dark:text-white shadow-sm focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
                <div className="absolute top-1.5 left-[15px] text-[11px] text-[#737373]">
                  Country/Region
                </div>
                <ChevronDown
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                />
                <div className="relative">
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-[#111] text-stone-900 dark:text-white shadow-sm focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white"
                  >
                    <option value="">State</option>
                    <option value="NY">NY</option>
                    <option value="CA">CA</option>
                    <option value="TX">TX</option>
                    <option value="FL">FL</option>
                    <option value="GA">GA</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373]"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ZIP code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                />
              </div>
              <div className="relative mt-1">
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-stone-900 dark:hover:text-white cursor-help">
                  <Info size={16} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-medium text-stone-900 dark:text-white tracking-tight mb-1">
                Payment
              </h2>
              <p className="text-[13px] text-[#737373] mb-1">
                All transactions are secure and encrypted.
              </p>

              <div className="p-4 border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] bg-white dark:bg-[#111] shadow-sm">
                <PaymentElement />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !stripe || !elements}
              className="w-full h-[60px] flex items-center justify-center bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[15px] font-bold rounded-[4px] hover:opacity-90 transition-all shadow-md mt-4 mb-24 disabled:opacity-70"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : "Pay now"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Order Summary */}
      <div className="hidden lg:block w-[45%] bg-[#18261e] dark:bg-[#0a0a0a] border-l border-transparent dark:border-stone-800 lg:min-h-screen pt-16 lg:pt-24 pb-12 px-6 lg:pl-[4%] lg:pr-12 transition-colors duration-700">
        <div className="w-full max-w-[420px] flex flex-col lg:sticky lg:top-37">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-white text-[22px] font-serif uppercase tracking-wider">
              FLEÑJURE
            </h2>
            <ShoppingBag className="text-white" size={20} strokeWidth={1} />
          </div>

          {/* Product Items */}
          <div className="flex flex-col gap-6 mb-7">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-white dark:bg-stone-900 border border-[#2a3a30] dark:border-stone-800 rounded-[6px] overflow-hidden flex-shrink-0 transition-colors duration-700">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                  <div className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-[rgba(114,114,114,0.9)] dark:bg-stone-700 rounded-full flex items-center justify-center text-[11px] text-white font-medium z-10 shadow-sm">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-white text-[14px] font-medium leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[#a5b0aa] dark:text-stone-400 text-[12px] font-normal mt-1 block">
                    {item.size}
                  </span>
                </div>
                <span className="text-white text-[14px] font-medium pl-2">
                  $
                  {(
                    parseFloat(item.price.replace("$", "")) * item.quantity
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Discount Code */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Discount code or gift card"
              className="flex-1 bg-white dark:bg-[#111] p-[14px] text-stone-900 dark:text-white text-[14px] placeholder:text-[#737373] outline-none rounded-[4px] shadow-sm border border-transparent dark:border-stone-800 focus:ring-1 focus:border-stone-900 dark:focus:ring-white focus:ring-stone-900"
            />
            <button
              className="px-6 py-[14px] bg-[#1f3025] dark:bg-[#222] text-white text-[14px] font-medium rounded-[4px] border border-[#2a3d31] dark:border-stone-800 hover:bg-[#25392b] dark:hover:bg-[#333] transition-all disabled:opacity-50"
              disabled
            >
              Apply
            </button>
          </div>

          {/* Subtotal / Shipping / Total */}
          <div className="flex flex-col gap-[14px] border-y border-[#2a3d31] dark:border-stone-800 py-5 mb-5 transition-colors duration-700">
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-white font-normal">
                Subtotal · {items.length} {items.length === 1 ? "item" : "items"}
              </span>
              <span className="text-white font-medium">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-white font-normal">Shipping</span>
              <span className="text-[#a5b0aa] dark:text-stone-400">
                Calculated at next step
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-xl font-medium tracking-tight">
              Total
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#a5b0aa] dark:text-stone-400 text-[12px] font-normal mt-1">
                USD
              </span>
              <span className="text-[24px] text-white font-semibold tabular-nums tracking-tight">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient() {
  const { items } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch client secret if we have items
    if (items.length === 0) return;

    fetch("/api/checkout/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch(console.error);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-stone-50 dark:bg-stone-950">
        <h2 className="text-2xl font-serif text-stone-900 dark:text-white mb-4">Your cart is empty</h2>
        <Link href="/shop" className="text-sm font-medium underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
