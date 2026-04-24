"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lock, ArrowRight, Bitcoin, CreditCard } from "lucide-react";

export default function CheckoutClient() {
  const { items } = useCartStore();
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const [step, setStep] = useState<"information" | "payment">("information");
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !address) return; // Basic validation
    setStep("payment");
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    // TODO: Await Stripe API Route implementation
    setTimeout(() => {
      alert("Stripe API integration pending user API key generation.");
      setIsProcessing(false);
    }, 1500);
  };

  const handleCryptoCheckout = async () => {
    setIsProcessing(true);
    // TODO: Await Coinbase Commerce API Route implementation
    setTimeout(() => {
      alert("Coinbase Commerce API integration pending user API key generation.");
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans text-stone-900">
      {/* LEFT: Forms */}
      <div className="w-full lg:w-1/2 flex flex-col items-center pt-12 pb-24 px-6 lg:px-24 bg-white z-10 border-r border-stone-200">
        <div className="w-full max-w-lg flex flex-col h-full">
          {/* Brand Header */}
          <Link href="/" className="text-3xl font-serif font-light tracking-widest uppercase mb-12 hover:opacity-70 transition-opacity">
            Fleñjure
          </Link>

          {/* Breadcrumbs */}
          <div className="flex gap-2 items-center text-xs uppercase tracking-widest text-stone-400 mb-12">
            <span className={step === "information" ? "text-stone-900 font-bold" : ""}>Information</span>
            <ChevronLeft className="rotate-180" size={14} />
            <span className={step === "payment" ? "text-stone-900 font-bold" : ""}>Payment</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "information" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1"
              >
                <form onSubmit={handleContinueToPayment} className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-serif font-light">Contact</h2>
                    <input 
                      type="email" 
                      required
                      placeholder="Email Address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 border border-stone-300 rounded-sm bg-transparent outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-serif font-light">Shipping address</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        required
                        placeholder="First name" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-4 border border-stone-300 rounded-sm bg-transparent outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400 text-sm"
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="Last name" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-4 border border-stone-300 rounded-sm bg-transparent outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400 text-sm"
                      />
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder="Address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-4 border border-stone-300 rounded-sm bg-transparent outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        required
                        placeholder="City" 
                        className="w-full p-4 border border-stone-300 rounded-sm bg-transparent outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400 text-sm"
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="ZIP code" 
                        className="w-full p-4 border border-stone-300 rounded-sm bg-transparent outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400 text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full p-5 mt-4 bg-stone-900 text-white uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-between"
                  >
                    <span>Continue to payment</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col"
              >
                <div className="mb-8 border border-stone-200 rounded-md p-4 text-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                    <span className="text-stone-500 w-24">Contact</span>
                    <span className="flex-1 truncate">{email}</span>
                    <button onClick={() => setStep("information")} className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-widest underline">Change</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 w-24">Ship to</span>
                    <span className="flex-1 truncate">{address}</span>
                    <button onClick={() => setStep("information")} className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-widest underline">Change</button>
                  </div>
                </div>

                <h2 className="text-xl font-serif font-light mb-6 flex items-center gap-2">
                  Payment Method <Lock size={16} className="text-stone-400" />
                </h2>
                <p className="text-stone-500 text-sm mb-8 font-light">All transactions are completely secure and encrypted.</p>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleStripeCheckout}
                    disabled={isProcessing}
                    className="group relative w-full overflow-hidden border border-stone-300 hover:border-stone-900 p-6 flex flex-col items-center justify-center gap-4 transition-all duration-500"
                  >
                     <div className="absolute inset-0 bg-stone-50 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" />
                     <CreditCard size={32} className="text-stone-900 z-10" strokeWidth={1} />
                     <span className="z-10 uppercase tracking-[0.2em] text-xs font-bold">Credit Card / Apple Pay</span>
                  </button>

                  <button 
                    onClick={handleCryptoCheckout}
                    disabled={isProcessing}
                    className="group relative w-full overflow-hidden border border-stone-300 hover:border-blue-600 hover:bg-stone-50 p-6 flex flex-col items-center justify-center gap-4 transition-all duration-500"
                  >
                     <div className="flex items-center gap-2 z-10 text-[#0052FF]">
                       <Bitcoin size={32} strokeWidth={1.5} />
                     </div>
                     <span className="z-10 uppercase tracking-[0.2em] text-xs font-bold text-stone-900">Pay with Crypto (Coinbase)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-16 flex gap-6 text-[10px] text-stone-400 uppercase tracking-widest border-t border-stone-100">
            <Link href="#" className="hover:text-stone-900 transition-colors">Refund policy</Link>
            <Link href="#" className="hover:text-stone-900 transition-colors">Shipping policy</Link>
          </div>
        </div>
      </div>

      {/* RIGHT: Order Summary */}
      <div className="w-full lg:w-1/2 flex flex-col items-center pt-12 pb-24 px-6 lg:px-24 bg-stone-50">
         <div className="w-full max-w-lg sticky top-12">
            <h2 className="text-xl font-serif font-light mb-8 pt-4 pb-0 hidden lg:block">Order Summary</h2>
            
            <div className="flex flex-col gap-6 mb-12">
              {items.length === 0 ? (
                <p className="text-sm text-stone-500 font-light italic">Your cart is empty.</p>
              ) : (
                items.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center gap-6">
                    <div className="relative aspect-square w-20 bg-stone-200 rounded-sm overflow-hidden flex-shrink-0 border border-stone-200">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover mix-blend-multiply"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center text-[10px] text-white z-10 shadow-sm border-2 border-stone-50">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-sm font-medium pr-4">{item.name}</span>
                      <span className="text-xs text-stone-500 uppercase tracking-wider">{item.size}</span>
                    </div>
                    <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-stone-200 pt-6 flex flex-col gap-4 text-sm mb-6">
              <div className="flex justify-between items-center text-stone-500">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-stone-500">
                <span>Shipping</span>
                <span className="text-xs uppercase tracking-widest border border-stone-300 px-2 py-1 bg-white">Calculated at next step</span>
              </div>
              <div className="flex justify-between items-center text-stone-500">
                <span>Estimated taxes</span>
                <span>$0.00</span>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6 flex justify-between items-end">
              <span className="text-lg font-serif">Total</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 tracking-widest font-light">USD</span>
                <span className="text-3xl font-medium">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
