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
import { supabase } from "@/lib/supabase";

const DISCOVER_LINKS = [
  { name: "New Arrivals", value: "New Arrivals" },
  { name: "Cafe", href: "/cafe" },
  { name: "Shop All", value: "All" },
];

export default function ShopClient({ products, collections = [] }: { products: any[], collections?: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Recommended");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const categoryLinks = collections.map(c => ({
    name: c.name,
    value: c.id
  }));

  // Scroll lock when drawers are open
  useEffect(() => {
    if (desktopSidebarOpen || isSortOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [desktopSidebarOpen, isSortOpen]);

  useEffect(() => {
    setMounted(true);
    const cat = searchParams.get("category");
    if (cat) {
      setActiveCategory(cat);
    }

    // Subscribe to realtime changes on the products table to immediately refresh the frontend
    const channel = supabase.channel('realtime:public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Trigger a soft refresh to re-fetch Server Components without losing client state
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchParams, router]);

  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = products
    .filter(p => {
      if (activeCategory === "All") return true;
      if (activeCategory === "New Arrivals") {
        return products.indexOf(p) < 4;
      }
      return p.collectionId === activeCategory;
    })
    .sort((a, b) => {
      if (currentSort === "Price: Low to high") {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
        return priceA - priceB;
      }
      if (currentSort === "Price: High to low") {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
        return priceB - priceA;
      }
      if (currentSort === "New arrivals") {
        // Assuming original order is newest to oldest or vice versa. 
        // For now, just reverse the array as a placeholder for 'newness'.
        return -1; 
      }
      return 0; // Recommended / Default
    });

  const handleCategoryClick = (val?: string, href?: string) => {
    if (href) {
      router.push(href);
    } else if (val) {
      setActiveCategory(val);
      setMobileFilterOpen(false);
      setDesktopSidebarOpen(false); // Close sidebar on click
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 md:pt-32 pb-32 md:pb-48 px-4 sm:px-6 lg:px-12 bg-[#fcfcfc] dark:bg-[#0a0a0a] transition-colors duration-1000">
      
      {/* ALD Style Top Header Bar */}
      <div className="w-full flex justify-between items-center pb-8 border-b border-stone-200 dark:border-stone-800 text-[10px] md:text-[11px] uppercase tracking-[0.05em]">
        
        {/* Left Side: Toggles & Menu */}
        <div className="flex items-center gap-6">
          {/* Desktop Sidebar Toggle */}
          <button 
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="font-medium text-stone-900 dark:text-stone-100 hidden md:flex items-center gap-2 hover:opacity-50 transition-opacity"
          >
            {activeCategory === "All" ? (
              <span>Shop All</span>
            ) : (
              <>
                <span className="text-stone-400">Shop All</span>
                <span className="text-stone-300 dark:text-stone-700 mx-1">›</span>
                <span>{collections.find(c => c.id === activeCategory)?.name || activeCategory}</span>
              </>
            )}
            <Plus size={10} className={clsx("transition-transform duration-300 ml-1", desktopSidebarOpen ? "rotate-45" : "")} />
          </button>
          
          {/* Mobile Filter Toggle / Current Category */}
          <button 
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="font-medium text-stone-900 dark:text-stone-100 md:hidden flex items-center gap-2"
          >
            {activeCategory === "All" ? (
              <span>Shop All</span>
            ) : (
              <>
                <span className="text-stone-400">Shop All</span>
                <span className="text-stone-300 dark:text-stone-700 mx-1">›</span>
                <span>{collections.find(c => c.id === activeCategory)?.name || activeCategory}</span>
              </>
            )}
            <Plus size={10} className={clsx("transition-transform duration-300 ml-1", mobileFilterOpen ? "rotate-45" : "")} />
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

        {/* Right Side: Sorting */}
        <div className="flex items-center gap-6 text-stone-500 dark:text-stone-400 font-medium">
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-2"
          >
            Sort: <span className="text-stone-900 dark:text-white">{currentSort}</span>
            <Plus size={10} className={clsx("transition-transform duration-300", isSortOpen ? "rotate-45" : "")} />
          </button>
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
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500">Shop By Collection</h3>
                <ul className="flex flex-col gap-4">
                  {categoryLinks.map(link => (
                    <li key={link.name}>
                      <button 
                        onClick={() => handleCategoryClick(link.value)}
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
      <div className="relative mt-0 pt-8 flex">
        
        {/* Desktop Sidebar & Overlay */}
        <AnimatePresence>
          {desktopSidebarOpen && (
            <>
              {/* Overlay over the grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="hidden md:block absolute inset-0 bg-stone-900/10 dark:bg-black/20 backdrop-blur-[1px] z-30"
                style={{ height: '1000%' }}
                onClick={() => setDesktopSidebarOpen(false)}
              />

              {/* Sidebar Content */}
              <motion.div 
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="hidden md:flex flex-col absolute top-0 left-0 w-64 lg:w-72 bg-[#fcfcfc] dark:bg-[#0a0a0a] z-40 gap-12 pt-8 pb-32 border-r border-stone-100 dark:border-stone-900 pr-8 min-h-screen"
              >
                 <div className="flex flex-col gap-5">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-stone-100">Discover</h3>
                    <ul className="flex flex-col gap-3.5">
                      {DISCOVER_LINKS.map(link => (
                        <li key={link.name}>
                          <button 
                            onClick={() => handleCategoryClick(link.value, link.href)}
                            className={clsx(
                              "text-[11px] font-medium tracking-wide transition-colors duration-300 text-left",
                              activeCategory === link.value ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                            )}
                          >
                            {link.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                 </div>

                 <div className="flex flex-col gap-5">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-stone-100">Shop By Collection</h3>
                    <ul className="flex flex-col gap-3.5">
                      {categoryLinks.map(link => (
                        <li key={link.name}>
                          <button 
                            onClick={() => handleCategoryClick(link.value)}
                            className={clsx(
                              "text-[11px] font-medium tracking-wide transition-colors duration-300 text-left",
                              activeCategory === link.value ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                            )}
                          >
                            {link.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Right Sort Sidebar & Overlay */}
        <AnimatePresence>
          {isSortOpen && (
            <>
              {/* Overlay over the grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-stone-900/10 dark:bg-black/20 backdrop-blur-[1px] z-30"
                style={{ height: '1000%' }}
                onClick={() => setIsSortOpen(false)}
              />

              {/* Slide-in Sort Sidebar */}
              <motion.div 
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="flex flex-col absolute top-0 right-0 w-64 lg:w-72 bg-[#fcfcfc] dark:bg-[#0a0a0a] z-40 gap-12 pt-8 pb-32 border-l border-stone-100 dark:border-stone-900 pl-8 min-h-screen"
              >
                 <div className="flex flex-col gap-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500">Sort By</h3>
                    <ul className="flex flex-col gap-4">
                      {["Recommended", "New arrivals", "Price: Low to high", "Price: High to low"].map(option => (
                        <li key={option}>
                          <button 
                            onClick={() => {
                              setCurrentSort(option);
                              setIsSortOpen(false);
                            }}
                            className={clsx(
                              "text-[11px] font-medium tracking-wide transition-colors duration-300 text-left w-full",
                              currentSort === option ? "text-stone-900 dark:text-white underline underline-offset-4" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                            )}
                          >
                            {option}
                          </button>
                        </li>
                      ))}
                    </ul>
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid Layout */}
        <main className="flex-1 w-full relative z-10 pt-0">
          {activeCategory.toLowerCase() === "collections" ? (
            <div className="flex flex-col gap-24 lg:gap-32 pb-24">
              {collections.length > 0 ? collections.map((collection, index) => {
                const colProducts = products.filter(p => p.collectionId === collection.id);
                if (colProducts.length === 0) return null;
                
                return (
                  <section key={collection.id}>
                    <div className={clsx(
                      "mb-10 text-stone-900 dark:text-white flex justify-between items-end",
                      index > 0 && "border-t border-stone-200 dark:border-stone-900 pt-16 lg:pt-24"
                    )}>
                      <h2 className="text-[13px] md:text-[14px] font-medium tracking-wide">{collection.name}</h2>
                    </div>
                    <div className={clsx(
                      "transition-all duration-1000",
                      viewMode === "grid" 
                        ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-12 sm:gap-x-4 md:gap-x-6 md:gap-y-16"
                        : "flex flex-col gap-12 md:gap-24 items-center"
                    )}>
                      {colProducts.map(product => (
                        <ProductCard key={product.id} product={product} viewMode={viewMode} addItem={addItem} />
                      ))}
                    </div>
                    <div className="mt-16 text-[10px] uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer w-max">
                      <Link href={`/shop?category=${collection.id}`} className="border-b border-stone-300 dark:border-stone-700 pb-1">View collection</Link>
                    </div>
                  </section>
                );
              }) : (
                <div className="py-32 text-center text-stone-500 text-sm tracking-widest uppercase">
                  No collections found.
                </div>
              )}
            </div>
          ) : (
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

              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} addItem={addItem} />
              ))}
            </div>
          )}
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
          if (!product.sizes || product.sizes.length === 0) {
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              size: "OS",
              quantity: 1
            });
            // Optional: you could open the cart here, but user asked for it to just 'add'
          } else {
            setIsOpen(true);
          }
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

function ProductCard({ product, viewMode, addItem }: { product: any; viewMode: "grid" | "single"; addItem: any }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className={clsx("group flex flex-col cursor-pointer w-full", viewMode === "single" ? "max-w-xl md:max-w-2xl" : "")}
    >
      <div className={clsx(
        "relative w-full overflow-hidden mb-4 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group border border-transparent dark:border-stone-900",
        viewMode === "grid" ? "aspect-[4/5] bg-[#f8f8f8] dark:bg-black shadow-none" : "aspect-square sm:aspect-[4/5] bg-[#f8f8f8] dark:bg-black shadow-none"
      )}>
        <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-0"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <Image
              src={product.hoverImage || product.image}
              alt={`${product.name} alternate view`}
              fill
              className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.05]"
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
  );
}
