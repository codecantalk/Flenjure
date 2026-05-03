"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Plus, X, LayoutGrid, SquareSquare, Sun, Moon } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useTheme } from "next-themes";

const DISCOVER_LINKS = [
  { name: "New Arrivals", value: "new-arrivals" },
  { name: "Cafe", href: "/cafe" },
  { name: "Collections", href: "/collections" },
  { name: "Shop All", value: "All" },
];

const CATEGORY_LINKS = [
  { name: "T-Shirts", value: "T-Shirts" },
  { name: "Shorts", value: "Shorts" },
  { name: "Tank Tops", value: "Tank Tops" },
  { name: "Hats and Headgear", value: "Hats and Headgear" },
  { name: "Candy Shop", href: "/cafe" },
];

export default function ShopClient({ products }: { products: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  const handleCategoryClick = (val?: string, href?: string) => {
    if (href) {
      router.push(href);
    } else if (val) {
      setActiveCategory(val);
      setMobileFilterOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 md:pt-32 px-4 sm:px-6 lg:px-12 bg-[#fcfcfc] dark:bg-[#0a0a0a] transition-colors duration-1000">
      
      {/* ALD Style Top Header Bar */}
      <div className="w-full flex justify-between items-center pb-8 border-b border-stone-200 dark:border-stone-800 text-[10px] md:text-[11px] uppercase tracking-[0.05em]">
        
        {/* Left Side: Toggles & Menu */}
        <div className="flex items-center gap-6">
          {/* Desktop Sidebar Toggle */}
          <button 
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="font-medium text-stone-900 dark:text-stone-100 hidden md:flex items-center gap-2 hover:opacity-50 transition-opacity"
          >
            {activeCategory === "All" ? "Shop All" : activeCategory} {desktopSidebarOpen ? <span className="text-base leading-none mb-[1px]">-</span> : <Plus size={10} />}
          </button>
          
          {/* Mobile Filter Toggle / Current Category */}
          <button 
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="font-medium text-stone-900 dark:text-stone-100 md:hidden flex items-center gap-2"
          >
             {activeCategory === "All" ? "Shop All" : activeCategory}
             <Plus size={10} className={clsx("transition-transform duration-300", mobileFilterOpen ? "rotate-45" : "")} />
          </button>

          {/* Grid & Theme Toggles (Beside Shop All) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setViewMode(viewMode === "grid" ? "single" : "grid")}
              className="hover:text-stone-900 dark:text-white transition-colors text-stone-500 dark:text-stone-400"
              aria-label="Toggle Grid View"
            >
              {viewMode === "grid" ? <SquareSquare size={14} strokeWidth={1.5} /> : <LayoutGrid size={14} strokeWidth={1.5} />}
            </button>
            
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:text-stone-900 dark:text-white transition-colors ml-2 text-stone-500 dark:text-stone-400"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Sorting (Desktop only) */}
        <div className="flex items-center gap-6 text-stone-500 dark:text-stone-400 font-medium">
          <div className="hidden sm:flex items-center gap-6">
            <span className="hover:text-stone-900 dark:hover:text-white cursor-pointer transition-colors">Sort: Recommended</span>
            <span className="hover:text-stone-900 dark:hover:text-white cursor-pointer transition-colors">Refine</span>
          </div>
        </div>
      </div>

      {/* Mobile Accordion Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-stone-200 dark:border-stone-800"
          >
            <div className="py-8 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500">Discover</h3>
                <ul className="flex flex-col gap-4">
                  {DISCOVER_LINKS.map(link => (
                    <li key={link.name}>
                      <button 
                        onClick={() => handleCategoryClick(link.value, link.href)}
                        className={clsx(
                          "text-xs font-medium tracking-wide transition-colors duration-300 text-left w-full",
                          activeCategory === link.value ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                        )}
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500">Shop By Category</h3>
                <ul className="flex flex-col gap-4">
                  {CATEGORY_LINKS.map(link => (
                    <li key={link.name}>
                      <button 
                        onClick={() => handleCategoryClick(link.value, link.href)}
                        className={clsx(
                          "text-xs font-medium tracking-wide transition-colors duration-300 text-left w-full",
                          activeCategory === link.value ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                        )}
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row mt-8 gap-8 lg:gap-16 relative">
        
        {/* Left Sidebar (Desktop) */}
        <AnimatePresence initial={false}>
          {desktopSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0, marginRight: 0 }}
              animate={{ width: "auto", opacity: 1, marginRight: "4rem" }}
              exit={{ width: 0, opacity: 0, marginRight: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="hidden md:flex flex-col w-48 lg:w-56 flex-shrink-0 sticky top-32 self-start gap-12 overflow-hidden"
            >
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-4 w-48 lg:w-56">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500">Discover</h3>
                  <ul className="flex flex-col gap-2.5">
                    {DISCOVER_LINKS.map(link => (
                      <li key={link.name}>
                        <button 
                          onClick={() => handleCategoryClick(link.value, link.href)}
                          className={clsx(
                            "text-xs font-medium tracking-wide transition-colors duration-300 text-left",
                            activeCategory === link.value ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                          )}
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
               </motion.div>

               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-4 w-48 lg:w-56">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500">Shop By Category</h3>
                  <ul className="flex flex-col gap-2.5">
                    {CATEGORY_LINKS.map(link => (
                      <li key={link.name}>
                        <button 
                          onClick={() => handleCategoryClick(link.value, link.href)}
                          className={clsx(
                            "text-xs font-medium tracking-wide transition-colors duration-300 text-left",
                            activeCategory === link.value ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                          )}
                        >
                          {link.name}
                        </button>
                      </li>
                    ))}
                  </ul>
               </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>


        {/* Product Grid */}
        <main className="flex-1 w-full">
          <div className={clsx(
            "transition-all duration-1000",
            viewMode === "grid" 
              ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-12 sm:gap-x-4 md:gap-x-6 md:gap-y-16"
              : "flex flex-col gap-12 md:gap-24 items-center"
          )}>
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-32 text-center text-stone-500 text-sm tracking-widest uppercase">
                No items found in this category.
              </div>
            )}

            {filteredProducts.map((product, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                key={product.id}
                className={clsx("group flex flex-col cursor-pointer w-full", viewMode === "single" ? "max-w-xl md:max-w-2xl" : "")}
              >
                <div className={clsx(
                  "relative w-full overflow-hidden mb-4 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group border border-transparent dark:border-stone-900",
                  viewMode === "grid" ? "aspect-[4/5] bg-[#f8f8f8] dark:bg-black shadow-none" : "aspect-square sm:aspect-[4/5] bg-[#f8f8f8] dark:bg-black shadow-none"
                )}>
                  <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0">
                    <div className="absolute inset-4 sm:inset-6">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain mix-blend-multiply dark:mix-blend-normal transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-0"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <Image
                        src={product.hoverImage || product.image}
                        alt={`${product.name} alternate view`}
                        fill
                        className="object-contain mix-blend-multiply dark:mix-blend-normal absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  </Link>

                  {/* Quick Add Trigger */}
                  <QuickAddTrigger product={product} addItem={addItem} />
                </div>
                
                {/* Product Meta */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-4 text-[10px] sm:text-[11px] uppercase tracking-widest font-medium">
                  <Link href={`/shop/${product.id}`} className="text-stone-900 dark:text-stone-100 transition-colors duration-500 ease-in-out hover:text-stone-400 line-clamp-1">
                    {product.name}
                  </Link>
                  <span className="text-stone-500 dark:text-stone-400 flex-shrink-0">{product.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function QuickAddTrigger({ product, addItem }: { product: any; addItem: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-stone-100 flex items-center justify-center text-stone-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-stone-900 hover:text-white"
        aria-label="Quick add"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-30 bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-3 sm:p-4 rounded-sm flex flex-col gap-3 sm:gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-400">Select Size</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-stone-400 hover:text-stone-900 transition-colors p-1"
              >
                <X size={12} strokeWidth={1} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {product.sizes ? product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      size,
                      quantity: 1
                    });
                    setIsOpen(false);
                  }}
                  className="flex-1 min-w-[32px] h-8 text-[10px] font-medium border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all flex items-center justify-center bg-white text-stone-900"
                >
                  {size}
                </button>
              )) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      size: "OS",
                      quantity: 1
                    });
                    setIsOpen(false);
                  }}
                  className="w-full h-8 text-[10px] font-medium border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all flex items-center justify-center bg-white text-stone-900"
                >
                  One Size (OS)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
