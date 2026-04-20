"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Plus, X } from "lucide-react";
import { useCartStore } from "@/lib/store";

import shopifyData from "@/data/products.json";

// Map Shopify standard JSON output to our local format
const products = shopifyData.products.map(p => ({
  id: p.handle,
  name: p.title,
  price: "$" + (p.variants?.[0]?.price || "0.00"),
  category: p.product_type || "Snacks",
  image: p.images?.[0]?.src || "https://images.unsplash.com/photo-1556821840-0a63f95609a7?q=80&w=2000&auto=format&fit=crop",
  hoverImage: p.images?.[1]?.src || p.images?.[0]?.src || "https://images.unsplash.com/photo-1556821840-0a63f95609a7?q=80&w=2000&auto=format&fit=crop",
  sizes: p.options?.find(o => o.name === "Size" || o.name === "Title")?.values
    .filter(v => v !== "Default Title") || []
}));

// Create unique categories based on product types + Fallback values
const rawTypes = shopifyData.products.map(p => p.product_type).filter(Boolean);
const uniqueCategories = Array.from(new Set(rawTypes));
const categories = ["All", "Essentials", "Snacks", ...uniqueCategories.filter(c => c !== "Essentials" && c !== "Snacks")];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-7xl font-serif mb-12 font-light"
          >
            Collection
          </motion.h1>
          
          {/* Filtering */}
          <div className="flex flex-wrap items-center gap-6 md:gap-12 mb-16 border-b border-stone-200 pb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={clsx(
                  "text-xs uppercase tracking-[0.15em] transition-all duration-700 ease-in-out pb-1 border-b min-h-[44px]",
                  activeCategory === category 
                    ? "border-stone-900 text-stone-900 font-normal" 
                    : "border-transparent text-stone-400 hover:text-stone-900 font-light"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
          {filteredProducts.map((product, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              key={product.id}
              className="group flex flex-col cursor-pointer"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f4f4f4] mb-5 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group">
                <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0">
                  <div className="absolute inset-6">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain mix-blend-multiply transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-0"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <Image
                      src={product.hoverImage}
                      alt={`${product.name} alternate view`}
                      fill
                      className="object-contain mix-blend-multiply absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.05]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Link>

                {/* Quick Add Icon Trigger */}
                <QuickAddTrigger product={product} addItem={addItem} />
              </div>
              <div className="flex justify-between items-start text-xs tracking-wide">
                <Link href={`/shop/${product.id}`} className="font-light text-stone-900 transition-colors duration-500 ease-in-out hover:text-stone-400">
                  {product.name}
                </Link>
                <span className="text-stone-500 font-light">{product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAddTrigger({ product, addItem }: { product: any; addItem: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-stone-100 flex items-center justify-center text-stone-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-stone-900 hover:text-white"
        aria-label="Quick add"
      >
        <Plus size={16} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-6 flex flex-col justify-center items-center gap-6"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X size={18} strokeWidth={1} />
            </button>
            
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Select Size</span>
            </div>

            <div className="flex flex-wrap justify-center gap-3 w-full">
              {product.sizes.length > 0 ? (
                product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        size: size,
                        image: product.image,
                        quantity: 1,
                      });
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 border border-stone-200 text-[10px] tracking-[0.15em] uppercase hover:bg-stone-900 hover:text-white transition-all duration-300 min-w-[60px]"
                  >
                    {size}
                  </button>
                ))
              ) : (
                <button
                  onClick={() => {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      size: "One Size",
                      image: product.image,
                      quantity: 1,
                    });
                    setIsOpen(false);
                  }}
                  className="px-6 py-3 border border-stone-200 text-[10px] tracking-[0.15em] uppercase hover:bg-stone-900 hover:text-white transition-all duration-300"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
