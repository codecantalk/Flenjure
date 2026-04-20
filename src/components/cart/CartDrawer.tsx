"use client";

import { X, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store";
import Link from "next/link";
import { useEffect } from "react";
import clsx from "clsx";

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity } = useCartStore();

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
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-[90vw] max-w-md bg-stone-50 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone-200">
              <h2 className="font-serif text-2xl">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-500 hover:text-stone-900 transition-colors"
                aria-label="Close cart"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-stone-500">
                  <p>Your cart is empty.</p>
                  <Link
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                    className="inline-block border-b border-stone-900 text-stone-900 text-sm uppercase tracking-widest font-semibold pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
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
                    className="flex gap-6 border-b border-stone-100 pb-6"
                  >
                    <div className="relative w-24 h-32 bg-stone-200 overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1 text-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className="font-light text-stone-900 tracking-wide text-[13px]">
                            {item.name}
                          </span>
                          <span className="text-stone-500 font-light text-[11px] uppercase tracking-widest mt-1">Size: {item.size}</span>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center border border-stone-200">
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, -1)}
                                className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                              >
                                <Minus size={10} strokeWidth={1} />
                              </button>
                              <span className="text-xs font-light min-w-[20px] text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, 1)}
                                className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                              >
                                <Plus size={10} strokeWidth={1} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id, item.size)}
                              className="text-[10px] text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-[0.15em] underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <span className="text-stone-900 font-light text-xs tracking-wide">{item.price}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-stone-200 bg-stone-50/90 backdrop-blur-md">
                <div className="flex justify-between items-end mb-6 text-sm">
                  <span className="uppercase tracking-widest text-stone-500">Subtotal</span>
                  <span className="text-lg font-medium text-stone-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button className="w-full py-4 bg-stone-900 text-stone-50 text-sm uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors">
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
