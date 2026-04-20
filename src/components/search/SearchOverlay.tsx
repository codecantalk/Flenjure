"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search as SearchIcon, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import shopifyData from "@/data/products.json";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const results = query.trim() === ""
    ? []
    : shopifyData.products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.product_type.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);

  const popularSearches = ["Snack Packs", "Jerseys", "Accessories", "New Arrivals"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 bg-white z-[100] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 lg:px-12 py-8">
            <div className="flex-1" />
            <span className="text-[14px] tracking-[0.3em] font-serif uppercase text-stone-900">Search</span>
            <div className="flex-1 flex justify-end">
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-stone-900 hover:opacity-50 transition-opacity"
                aria-label="Close search"
              >
                <X size={24} strokeWidth={1} />
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="px-6 lg:px-12 max-w-4xl mx-auto w-full mt-12 md:mt-24">
            <div className="relative border-b border-stone-200 pb-4 flex items-center gap-4">
              <SearchIcon size={24} strokeWidth={1} className="text-stone-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search our store..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-2xl md:text-4xl font-light tracking-wide text-stone-900 placeholder:text-stone-200"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X size={20} strokeWidth={1} className="text-stone-400" />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Popular Searches / Results */}
              <div>
                {query.trim() === "" ? (
                  <div className="flex flex-col gap-8">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Popular Searches</h3>
                    <div className="flex flex-col gap-4">
                      {popularSearches.map(term => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="text-lg font-light text-stone-600 hover:text-stone-900 transition-colors text-left flex items-center justify-between group"
                        >
                          {term}
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Products ({results.length})</h3>
                    {results.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {results.map(product => (
                          <Link
                            key={product.id}
                            href={`/shop/${product.handle}`}
                            onClick={onClose}
                            className="flex gap-4 group"
                          >
                            <div className="relative w-16 h-20 bg-[#f4f4f4] overflow-hidden shrink-0">
                              <Image
                                src={product.images[0]?.src || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop"}
                                alt={product.title}
                                fill
                                className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                              />
                            </div>
                            <div className="flex flex-col justify-center gap-1">
                              <span className="text-sm font-light text-stone-900 group-hover:text-stone-400 transition-colors">{product.title}</span>
                              <span className="text-xs text-stone-400">${product.variants[0].price}</span>
                            </div>
                          </Link>
                        ))}
                        {shopifyData.products.length > 6 && (
                          <Link
                            href="/shop"
                            onClick={onClose}
                            className="text-xs uppercase tracking-widest font-medium border-b border-stone-900 self-start pb-1 mt-4"
                          >
                            View All Results
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="text-stone-400 font-light">No products found for &quot;{query}&quot;</p>
                    )}
                  </div>
                )}
              </div>

              {/* Editorial / Featured Search */}
              <div className="hidden md:block">
                <div className="relative aspect-[4/5] w-full bg-stone-100 overflow-hidden group">
                  <Image
                    src="/Flenjure-herobg.png"
                    alt="Featured Search"
                    fill
                    className="object-cover transition-transform duration-3000 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium block mb-2">New Arrival</span>
                    <h4 className="text-2xl font-serif font-light">The OG Jersey</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
