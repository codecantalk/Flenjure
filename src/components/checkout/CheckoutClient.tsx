"use client";

import { useState, useEffect } from "react";
import { useCartStore, useCurrencyStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

function CheckoutForm({ clientSecret, isCafeMode }: { clientSecret: string, isCafeMode?: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const { currency } = useCurrencyStore();
  const searchParams = useSearchParams();
  const cartTotal = items.reduce((total, item) => {
    const priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : (Number(item.price) || 0);
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
  const [snapchat, setSnapchat] = useState("");
  const [country, setCountry] = useState("US");
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const getDefaultMethod = () => {
    if (currency === 'GBP') return 'lloyds';
    if (currency === 'EUR') return 'revolut';
    return 'zelle';
  };

  const [selectedMethod, setSelectedMethod] = useState<string>('revolut');

  useEffect(() => {
    const paramMethod = searchParams.get('method');
    if (paramMethod) {
      setSelectedMethod(paramMethod);
    } else {
      setSelectedMethod(getDefaultMethod());
    }
  }, [searchParams, currency]);

  const getAvailableMethods = () => {
    if (currency === 'GBP') {
      return [
        { id: 'lloyds', label: 'Bank Transfer' },
        { id: 'cash', label: 'Cash' }
      ];
    }
    if (currency === 'EUR') {
      return [
        { id: 'revolut', label: 'Revolut' },
        { id: 'cash', label: 'Cash' }
      ];
    }
    return [
      { id: 'zelle', label: 'Zelle' },
      { id: 'cashapp', label: 'Cash App' },
      { id: 'crypto', label: 'Crypto' }
    ];
  };

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
          price: typeof i.price === 'string' ? parseFloat(i.price.replace(/[^0-9.-]+/g, "")) : (Number(i.price) || 0),
        })),
        is_recovered: false,
      }).catch(console.error);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [email, phone, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCafeMode && (!stripe || !elements)) return;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !state ||
      !zip ||
      !phone ||
      !snapchat
    ) {
      return alert("Please fill in all required shipping and contact fields");
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

    if (isCafeMode) {
      if (!transactionId) {
        return alert("Please enter your Transaction ID or Handle used for payment to verify your order.");
      }
      
      setIsProcessing(true);
      // Manual Cafe Flow
      try {
        const response = await fetch("/api/checkout/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, firstName, lastName, address, city, state, zip, phone, snapchat, transactionId, items }),
        });
        const resData = await response.json();
        clearCart();
        if (resData.orderId) {
          router.push(`/checkout/success?orderId=${resData.orderId}`);
        } else {
          router.push("/checkout/success");
        }
      } catch (e: any) {
        alert(e.message);
        setIsProcessing(false);
      }
      return;
    }

    if (!stripe || !elements) return;
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
            {formatPrice(cartTotal)}
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
                    <button 
                      onClick={() => useCartStore.getState().removeItem(item.id, item.size)}
                      type="button"
                      className="ml-4 text-[10px] text-stone-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      Remove
                    </button>
                    <div className="text-[14px] font-medium text-stone-900 dark:text-white pl-4">
                      {formatPrice((typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : (Number(item.price) || 0)) * item.quantity)}
                    </div>
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
                <select 
                  value={country}
                  onChange={(e) => {
                     setCountry(e.target.value);
                     setState("");
                  }}
                  className="w-full p-[14px] pt-5 border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-[#111] text-stone-900 dark:text-white shadow-sm focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white"
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="CH">Switzerland</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="DK">Denmark</option>
                  <option value="FI">Finland</option>
                  <option value="IE">Ireland</option>
                  <option value="NZ">New Zealand</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="SG">Singapore</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="SA">Saudi Arabia</option>
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
                {country === 'US' ? (
                  <div className="relative">
                    <select
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-[#111] text-stone-900 dark:text-white shadow-sm focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white"
                    >
                      <option value="">State</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="DC">District Of Columbia</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
                    />
                  </div>
                ) : country === 'CA' ? (
                  <div className="relative">
                    <select
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-[#111] text-stone-900 dark:text-white shadow-sm focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white"
                    >
                      <option value="">Province</option>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
                    />
                  </div>
                ) : country === 'AU' ? (
                  <div className="relative">
                    <select
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-[#111] text-stone-900 dark:text-white shadow-sm focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white"
                    >
                      <option value="">State / Territory</option>
                      <option value="ACT">Australian Capital Territory</option>
                      <option value="NSW">New South Wales</option>
                      <option value="NT">Northern Territory</option>
                      <option value="QLD">Queensland</option>
                      <option value="SA">South Australia</option>
                      <option value="TAS">Tasmania</option>
                      <option value="VIC">Victoria</option>
                      <option value="WA">Western Australia</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="State / Province / Region"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                  />
                )}
                <input
                  type="text"
                  required
                  placeholder="ZIP code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-stone-900 dark:hover:text-white cursor-help">
                    <Info size={16} />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Snapchat Handle"
                    value={snapchat}
                    onChange={(e) => setSnapchat(e.target.value)}
                    className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white shadow-sm placeholder:text-[#ababab] text-stone-900 dark:text-white bg-white dark:bg-[#111]"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-stone-900 dark:hover:text-white cursor-help">
                    <Info size={16} />
                  </div>
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

              {isCafeMode ? (
                <div className="p-4 border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] bg-white dark:bg-[#111] shadow-sm flex flex-col gap-4">
                   <p className="text-sm font-medium text-stone-900 dark:text-white mb-1">Cafe Exclusive Payments</p>
                   
                   {/* Custom Tab Selector */}
                   <div className="flex flex-wrap gap-2 mb-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                     {getAvailableMethods().map((m) => (
                       <button
                         key={m.id}
                         type="button"
                         onClick={() => setSelectedMethod(m.id)}
                         className={clsx(
                           "py-2 px-4 text-xs font-semibold uppercase tracking-wider border transition-all rounded-[4px]",
                           selectedMethod === m.id
                             ? "bg-stone-900 text-white dark:bg-white dark:text-black border-stone-900 dark:border-white shadow-sm"
                             : "bg-stone-50 dark:bg-[#1a1a1a] text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-white"
                         )}
                       >
                         {m.label}
                       </button>
                     ))}
                   </div>

                   {/* Lloyds Bank Transfer details */}
                   {selectedMethod === 'lloyds' && (
                     <div className="bg-stone-50 dark:bg-[#161616] p-4 border border-stone-200 dark:border-stone-800 text-sm rounded-[4px] leading-relaxed">
                       <strong className="text-stone-900 dark:text-white uppercase tracking-wider text-xs block mb-3 border-b pb-1 border-stone-200 dark:border-stone-800">Lloyds Bank Transfer</strong>
                       <div className="space-y-1 text-stone-700 dark:text-stone-300 text-xs">
                         <p><span className="text-stone-400 uppercase w-28 inline-block font-mono">Account Name:</span> <strong className="text-stone-900 dark:text-white">Abiodun Adesanmi</strong></p>
                         <p><span className="text-stone-400 uppercase w-28 inline-block font-mono">Sort Code:</span> <strong className="text-stone-900 dark:text-white">30-96-24</strong></p>
                         <p><span className="text-stone-400 uppercase w-28 inline-block font-mono">Account No:</span> <strong className="text-stone-900 dark:text-white">38718660</strong></p>
                         <p className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">Please reference the transaction with your full name.</p>
                       </div>
                     </div>
                   )}

                   {/* Revolut Details */}
                   {selectedMethod === 'revolut' && (
                     <div className="bg-stone-50 dark:bg-[#161616] p-4 border border-stone-200 dark:border-stone-800 text-sm rounded-[4px] leading-relaxed flex flex-col sm:flex-row gap-4 items-center justify-between">
                       <div className="space-y-1 text-stone-700 dark:text-stone-300 text-xs flex-1">
                         <strong className="text-stone-900 dark:text-white uppercase tracking-wider text-xs block mb-3 border-b pb-1 border-stone-200 dark:border-stone-800">Revolut Transfer</strong>
                         <p>Send <strong className="text-stone-900 dark:text-white">{formatPrice(cartTotal)}</strong> directly via our payment link:</p>
                         <p className="text-base font-semibold text-stone-900 dark:text-white mt-2 font-mono">
                           <a href="https://revolut.me/flenjure" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-500">https://revolut.me/flenjure</a>
                         </p>
                         <p className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">Alternatively, scan the QR code to pay instantly via Revolut app.</p>
                       </div>
                       <div className="flex-shrink-0 bg-white p-2 border border-stone-200 rounded-[4px]">
                         <img
                           src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://revolut.me/flenjure"
                           alt="Revolut Pay QR"
                           className="w-[100px] h-[100px] object-contain"
                         />
                       </div>
                     </div>
                   )}

                   {/* Zelle Details */}
                   {selectedMethod === 'zelle' && (
                     <div className="bg-stone-50 dark:bg-[#161616] p-4 border border-stone-200 dark:border-stone-800 text-sm rounded-[4px] leading-relaxed">
                       <strong className="text-stone-900 dark:text-white uppercase tracking-wider text-xs block mb-3 border-b pb-1 border-stone-200 dark:border-stone-800">Zelle Payment</strong>
                       <div className="space-y-1 text-stone-700 dark:text-stone-300 text-xs">
                         <p>Please send payment via Zelle to our official billing email:</p>
                         <p className="text-sm font-semibold text-stone-900 dark:text-white mt-2 font-mono">sales@flenjure.com</p>
                         <p className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">Please verify you are sending to Flenjure Ltd before finalizing.</p>
                       </div>
                     </div>
                   )}

                   {/* Cash App Details */}
                   {selectedMethod === 'cashapp' && (
                     <div className="bg-stone-50 dark:bg-[#161616] p-4 border border-stone-200 dark:border-stone-800 text-sm rounded-[4px] leading-relaxed flex flex-col sm:flex-row gap-4 items-center justify-between">
                       <div className="space-y-1 text-stone-700 dark:text-stone-300 text-xs flex-1">
                         <strong className="text-stone-900 dark:text-white uppercase tracking-wider text-xs block mb-3 border-b pb-1 border-stone-200 dark:border-stone-800">Cash App Payment</strong>
                         <p>Send <strong className="text-stone-900 dark:text-white">{formatPrice(cartTotal)}</strong> directly to our Cashtag:</p>
                         <p className="text-base font-semibold text-stone-900 dark:text-white mt-2 font-mono">$Flenjure</p>
                         <p className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">Scan QR to pay instantly.</p>
                       </div>
                       <div className="flex-shrink-0 bg-white p-2 border border-stone-200 rounded-[4px]">
                         <img
                           src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://cash.app/$Flenjure"
                           alt="Cash App QR"
                           className="w-[100px] h-[100px] object-contain"
                         />
                       </div>
                     </div>
                   )}

                   {/* Crypto Details */}
                   {selectedMethod === 'crypto' && (
                     <div className="bg-stone-50 dark:bg-[#161616] p-4 border border-stone-200 dark:border-stone-800 text-sm rounded-[4px] leading-relaxed">
                       <strong className="text-stone-900 dark:text-white uppercase tracking-wider text-xs block mb-3 border-b pb-1 border-stone-200 dark:border-stone-800">Cryptocurrency Address</strong>
                       <div className="space-y-4 text-stone-700 dark:text-stone-300 text-xs">
                         <div className="flex items-center gap-3">
                           <div className="flex-shrink-0 bg-white p-1 border border-stone-200 rounded-[4px]">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=bitcoin:bc1ptmyun9ehvy3pnnlpekgrzqr3847fk2sv7jwqyqpjteulrkv3msaszej6fs" alt="BTC QR" className="w-[50px] h-[50px] object-contain" />
                           </div>
                           <div className="flex-1 overflow-hidden">
                             <p className="text-[10px] text-stone-400 font-mono uppercase font-bold">Bitcoin (BTC):</p>
                             <p className="font-mono bg-white dark:bg-stone-950 p-1.5 border rounded border-stone-200 dark:border-stone-900 select-all overflow-x-auto text-[11px] mt-1">bc1ptmyun9ehvy3pnnlpekgrzqr3847fk2sv7jwqyqpjteulrkv3msaszej6fs</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="flex-shrink-0 bg-white p-1 border border-stone-200 rounded-[4px]">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=ethereum:0x8504d8c39DED293A27f15791E5Bbd6bea0BB7760" alt="ETH QR" className="w-[50px] h-[50px] object-contain" />
                           </div>
                           <div className="flex-1 overflow-hidden">
                             <p className="text-[10px] text-stone-400 font-mono uppercase font-bold">Ethereum / USDT (ERC-20):</p>
                             <p className="font-mono bg-white dark:bg-stone-950 p-1.5 border rounded border-stone-200 dark:border-stone-900 select-all overflow-x-auto text-[11px] mt-1">0x8504d8c39DED293A27f15791E5Bbd6bea0BB7760</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="flex-shrink-0 bg-white p-1 border border-stone-200 rounded-[4px]">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=solana:AWLUMmFp8kmuJyRjH1iK3aAnNZjnHxhaNMsUy3Wf5cGE" alt="SOL QR" className="w-[50px] h-[50px] object-contain" />
                           </div>
                           <div className="flex-1 overflow-hidden">
                             <p className="text-[10px] text-stone-400 font-mono uppercase font-bold">Solana (SOL):</p>
                             <p className="font-mono bg-white dark:bg-stone-950 p-1.5 border rounded border-stone-200 dark:border-stone-900 select-all overflow-x-auto text-[11px] mt-1">AWLUMmFp8kmuJyRjH1iK3aAnNZjnHxhaNMsUy3Wf5cGE</p>
                           </div>
                         </div>
                         <p className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">Only send exact matching assets to the addresses above. Wrong tokens sent will be permanently lost.</p>
                       </div>
                     </div>
                   )}

                   {/* Cash Details */}
                   {selectedMethod === 'cash' && (
                     <div className="bg-stone-50 dark:bg-[#161616] p-4 border border-stone-200 dark:border-stone-800 text-sm rounded-[4px] leading-relaxed">
                       <strong className="text-stone-900 dark:text-white uppercase tracking-wider text-xs block mb-3 border-b pb-1 border-stone-200 dark:border-stone-800">Cash Handover / Cash on Delivery</strong>
                       <div className="space-y-1 text-stone-700 dark:text-stone-300 text-xs">
                         <p>Pay with cash upon local pickup/delivery.</p>
                         <p className="mt-3">Please contact our support via WhatsApp or email to coordinate handover logistics:</p>
                         <p className="text-sm font-semibold text-stone-900 dark:text-white mt-2 font-mono">sales@flenjure.com</p>
                         <p className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">Your order will remain pending verification until physical cash handover is completed.</p>
                       </div>
                     </div>
                   )}

                   <p className="text-xs text-stone-500 mt-2">After sending the funds, please enter your handle or transaction ID below to verify your order.</p>
                   <input
                     type="text"
                     value={transactionId}
                     onChange={(e) => setTransactionId(e.target.value)}
                     placeholder="e.g. $MyCashAppTag or TxID"
                     className="w-full bg-stone-50 dark:bg-[#1a1a1a] p-[14px] text-stone-900 dark:text-white text-[14px] placeholder:text-[#737373] outline-none rounded-[4px] shadow-sm border border-stone-200 dark:border-stone-800 focus:ring-1 focus:border-stone-900 dark:focus:ring-white focus:ring-stone-900"
                   />
                </div>
              ) : (
                <div className="p-4 border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] bg-white dark:bg-[#111] shadow-sm">
                  <PaymentElement />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || (!isCafeMode && (!stripe || !elements))}
              className="w-full h-[60px] flex items-center justify-center bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[15px] font-bold rounded-[4px] hover:opacity-90 transition-all shadow-md mt-4 mb-24 disabled:opacity-70"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : (isCafeMode ? "I have paid" : "Pay now")}
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
                  <div className="absolute w-[22px] h-[22px] bg-[rgba(114,114,114,0.9)] dark:bg-stone-700 rounded-full flex items-center justify-center text-[11px] text-white font-medium z-10 shadow-sm">
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
                  <button 
                    onClick={() => useCartStore.getState().removeItem(item.id, item.size)}
                    type="button"
                    className="text-left mt-2 text-[10px] text-stone-500 hover:text-white uppercase tracking-widest transition-colors w-fit"
                  >
                    Remove
                  </button>
                </div>
                <span className="text-white text-[14px] font-medium pl-2">
                  {formatPrice((typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : (Number(item.price) || 0)) * item.quantity)}
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
                {formatPrice(cartTotal)}
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
                {formatPrice(cartTotal)}
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
  const { currency } = useCurrencyStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const hasCafeItems = items.some(i => i.isCafe);

  useEffect(() => {
    // Only fetch client secret if we have items and they are not manual cafe items
    if (items.length === 0 || hasCafeItems) return;

    fetch("/api/checkout/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, currency }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch(console.error);
  }, [items, hasCafeItems, currency]);

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

  if (!clientSecret && !hasCafeItems) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (hasCafeItems) {
    return (
      <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
        <CheckoutForm clientSecret="" isCafeMode={true} />
      </Elements>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: clientSecret!, appearance: { theme: 'stripe' } }}>
      <CheckoutForm clientSecret={clientSecret!} />
    </Elements>
  );
}
