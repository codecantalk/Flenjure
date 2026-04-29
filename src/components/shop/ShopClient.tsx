"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import clsx from "clsx";
import { Plus, X, LayoutGrid, SquareSquare } from "lucide-react";
import { useCartStore } from "@/lib/store";

// Client component that orchestrates the UI using the fresh Sanity data
export default function ShopClient({ products }: { products: any[] }) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      if (cat === "t-shirts") setActiveCategory("T-Shirts");
      else if (cat === "shorts") setActiveCategory("Shorts");
      else if (cat === "tank-tops") setActiveCategory("Tank Tops");
      else if (cat === "headgear") setActiveCategory("Hats and Headgear");
      else if (cat === "new-arrivals") setActiveCategory("New Arrivals");
      else setActiveCategory(cat);
    }
  }, [searchParams]);

  // Derive categories dynamically from the actual live dataset
  const rawTypes = products.map(p => p.category).filter(Boolean);
  const uniqueCategories = Array.from(new Set(rawTypes));
  const categories = ["All", "Essentials", "Snacks", ...uniqueCategories.filter((c: any) => c !== "Essentials" && c !== "Snacks")];
  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-32 gap-8 text-center pt-12">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">Shop</span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-serif font-light tracking-tight uppercase"
          >
            FLEÑJURE <span className="italic text-stone-400">ESSENTIALS</span>
          </motion.h1>
        </div>

        {/* Asymmetric Parallax Grid (Featured Essentials) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20 md:gap-32 items-center mb-48 border-b border-stone-200 pb-32">
          {/* 1. Rolling Papers (Left - Medium) */}
          <div className="md:col-span-1" />
          <div className="md:col-span-4 group">
            <ParallaxProductCard
              product={products.find(p => p.id === "flenjure-cali-rolling-papers") || products[0]}
              addItem={addItem}
              speed={-40}
              aspect="aspect-[3/4]"
            />
          </div>

          {/* 2. Bag Packs (Center/Right - Large) */}
          <div className="md:col-span-6 md:translate-y-24 group">
            <ParallaxProductCard
              product={products.find(p => p.id === "flenjure-snack-packs") || products[1]}
              addItem={addItem}
              speed={60}
              aspect="aspect-[4/5]"
            />
          </div>
          <div className="md:col-span-1" />

          {/* Gap */}
          <div className="col-span-full h-24 md:h-12" />

          {/* 3. OG Jersey (Full width / Asymmetric Right) */}
          <div className="md:col-span-3" />
          <div className="md:col-span-7 group">
            <ParallaxProductCard
              product={products.find(p => p.id === "flenjure-og-jersey") || products[2]}
              addItem={addItem}
              speed={-20}
              aspect="aspect-[16/10]"
            />
          </div>
          <div className="md:col-span-2" />
        </div>
        
        {/* Full Collection Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl md:text-5xl font-serif font-light">Full Collection</h2>
            <div className="hidden md:flex gap-4 border border-stone-200 p-2 rounded-sm bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <button 
                onClick={() => setViewMode("grid")}
                className={clsx("transition-colors", viewMode === "grid" ? "text-stone-900 dark:text-white" : "text-stone-300 dark:text-stone-700 hover:text-stone-500")}
              >
                <LayoutGrid size={18} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode("single")}
                className={clsx("transition-colors", viewMode === "single" ? "text-stone-900 dark:text-white" : "text-stone-300 dark:text-stone-700 hover:text-stone-500")}
              >
                <SquareSquare size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          
          {/* Filtering */}
          <div className="flex flex-wrap items-center gap-6 md:gap-12 border-b border-stone-200 dark:border-stone-800 pb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={clsx(
                  "text-[10px] uppercase tracking-[0.2em] transition-all duration-700 ease-in-out pb-2 min-h-[30px]",
                  activeCategory === category 
                    ? "border-b border-stone-900 dark:border-white text-stone-900 dark:text-white font-bold" 
                    : "border-b border-transparent text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Layout Engine */}
        <div className={clsx(
          "transition-all duration-1000",
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16"
            : "flex flex-col gap-24 md:gap-48 items-center"
        )}>
          {filteredProducts.map((product, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              key={product.id}
              className={clsx("group flex flex-col cursor-pointer w-full", viewMode === "single" ? "max-w-4xl" : "")}
            >
              <div className={clsx(
                "relative w-full overflow-hidden mb-5 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group border border-transparent dark:border-stone-900",
                viewMode === "grid" ? "aspect-[4/5] bg-[#f8f8f8] dark:bg-black shadow-sm" : "aspect-square sm:aspect-[4/5] bg-[#f8f8f8] dark:bg-black shadow-sm"
              )}>
                <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0">
                  <div className="absolute inset-6">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain mix-blend-multiply dark:mix-blend-normal transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-0"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <Image
                      src={product.hoverImage || product.image}
                      alt={`${product.name} alternate view`}
                      fill
                      className="object-contain mix-blend-multiply dark:mix-blend-normal absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.05]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Link>

                {/* Quick Add Icon Trigger */}
                <QuickAddTrigger product={product} addItem={addItem} />
              </div>
              <div className="flex justify-between items-start text-xs tracking-wide">
                <Link href={`/shop/${product.id}`} className="font-light text-stone-900 dark:text-stone-100 transition-colors duration-500 ease-in-out hover:text-stone-400">
                  {product.name}
                </Link>
                <span className="text-stone-500 dark:text-stone-400 font-light">{product.price}</span>
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
              {product.sizes.length > 0 ? (
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Select Size</span>
              ) : (
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Quick Add</span>
              )}
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

function ParallaxProductCard({ product, addItem, speed, aspect }: { product: any; addItem: any; speed: number; aspect: string }) {
  const containerRef = useRef(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

  if (!product) return null;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-8">
      <div className={clsx(
        "relative overflow-hidden bg-[#f8f8f8] dark:bg-black transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group border border-transparent dark:border-stone-900 shadow-sm",
        aspect
      )}>
        <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0">
          <motion.div style={{ y }} className="absolute inset-8 md:inset-16 h-full w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </Link>

        {/* Quick Add Icon Trigger */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="absolute top-8 right-8 z-20 w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm border border-stone-100 flex items-center justify-center text-stone-900 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-700 hover:bg-stone-900 hover:text-white shadow-lg"
          aria-label="Quick add"
        >
          <Plus size={24} strokeWidth={1} />
        </button>

        <AnimatePresence>
          {isQuickAddOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md p-8 flex flex-col justify-center items-center gap-8"
            >
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900 transition-colors"
                aria-label="Close"
              >
                <X size={24} strokeWidth={1} />
              </button>

              <div className="text-center">
                {product.sizes.length > 0 && (
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Options</span>
                )}
                <h4 className="text-xl font-serif font-light mt-2 text-stone-900 dark:text-white">{product.name}</h4>
              </div>

              <div className="flex flex-wrap justify-center gap-4 w-full max-w-sm">
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
                        setIsQuickAddOpen(false);
                      }}
                      className="px-6 py-3 border border-stone-200 text-[10px] tracking-[0.2em] uppercase hover:bg-stone-900 hover:text-white transition-all duration-300 min-w-[80px] font-medium"
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
                      setIsQuickAddOpen(false);
                    }}
                    className="px-10 py-4 border border-stone-900 text-[10px] tracking-[0.3em] uppercase bg-stone-900 text-white hover:bg-transparent hover:text-stone-900 transition-all duration-300 font-bold"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <Link href={`/shop/${product.id}`}>
            <h4 className="font-serif text-2xl font-light tracking-wide max-w-[70%] text-stone-900 dark:text-stone-100 hover:text-stone-400 transition-colors">{product.name}</h4>
          </Link>
          <span className="font-semibold text-stone-900 dark:text-white text-sm mt-1">{product.price}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-stone-400">
          <span className="w-8 h-[1px] bg-stone-200" />
          <span>Shop Essential</span>
        </div>
      </div>
    </div>
  );
}
