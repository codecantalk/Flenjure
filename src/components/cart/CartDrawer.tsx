"use client";

import { X, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useCurrencyStore } from "@/lib/store";
import Link from "next/link";
import { useEffect } from "react";
import clsx from "clsx";

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity } = useCartStore();
  const formatPrice = useCurrencyStore((state) => state.formatPrice);

  // Prevent scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const cartTotal = items.reduce((total, item) => {
    const priceNum = parseFloat(item.price.replace("$", ""));
    return total + priceNum * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-[95vw] sm:w-[450px] bg-white dark:bg-stone-950 z-[100] shadow-2xl flex flex-col transition-colors duration-1000"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#e6e6e6] dark:border-stone-800">
              <h2 className="font-serif text-2xl font-light text-stone-900 dark:text-white">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-stone-400 dark:text-stone-500">
                  <p className="font-light text-sm">Your cart is empty.</p>
                  <Link
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                    className="inline-block border-b border-stone-900 dark:border-white text-stone-900 dark:text-white text-[10px] uppercase tracking-widest font-semibold pb-1 hover:opacity-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                items.map((item, idx) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-6 border-b border-[#e6e6e6] dark:border-stone-800 pb-6"
                  >
                    <div className="relative w-20 h-28 bg-[#f4f4f4] dark:bg-stone-900 overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1 text-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1 pr-4">
                          <span className="font-normal text-stone-900 dark:text-stone-100 text-sm leading-tight">
                            {item.name}
                          </span>
                          <span className="text-stone-500 font-light text-[11px] uppercase tracking-wider mt-1">{item.size}</span>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center border border-[#e6e6e6] dark:border-stone-800">
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, -1)}
                                className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                              >
                                <Minus size={10} strokeWidth={1.5} />
                              </button>
                              <span className="text-xs font-light min-w-[20px] text-center dark:text-stone-300">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, 1)}
                                className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                              >
                                <Plus size={10} strokeWidth={1.5} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id, item.size)}
                              className="text-[10px] text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors uppercase tracking-[0.1em] underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <span className="text-stone-900 dark:text-white font-light text-sm">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-[#e6e6e6] dark:border-stone-800 bg-white dark:bg-stone-950 transition-colors duration-1000">
                <div className="flex justify-between items-end mb-4 text-xs">
                  <span className="uppercase tracking-[0.1em] text-[10px] font-bold text-stone-500">Subtotal</span>
                  <span className="text-base font-normal text-stone-900 dark:text-white uppercase">{formatPrice(cartTotal)}</span>
                </div>
                
                {/* Free Shipping Incentive */}
                <div className="mb-8 flex flex-col gap-3">
                   <div className="flex justify-center">
                     <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400">
                       {cartTotal >= 200 ? "Free Shipping Earned" : `${formatPrice(200 - cartTotal)} away from free shipping`}
                     </span>
                   </div>
                   <div className="w-full h-[3px] bg-stone-100 dark:bg-stone-900 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (cartTotal / 200) * 100)}%` }}
                        className="h-full bg-stone-900 dark:bg-white"
                      />
                   </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="flex-1 border border-stone-200 dark:border-stone-800 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
                  >
                    Update
                  </button>
                  <Link href="/checkout" onClick={() => setIsOpen(false)} className="flex-1 flex items-center justify-center py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-[0.2em] font-bold hover:opacity-80 transition-opacity">
                    Checkout
                  </Link>
                </div>
                
                <div className="flex justify-center">
                  <Link 
                    href="/checkout" 
                    onClick={() => setIsOpen(false)}
                    className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
