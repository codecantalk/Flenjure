"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useCurrencyStore } from "@/lib/store";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getCafeItems } from "@/app/admin/actions";

export default function CafeClient() {
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const isVerified = sessionStorage.getItem("flenjure_age_verified");
    if (!isVerified) {
      setShowAgeModal(true);
      document.body.style.overflow = "hidden";
    }

    async function fetchItems() {
      const data = await getCafeItems();
      setItems(data.filter((item: any) => item.in_stock));
    }
    fetchItems();
  }, []);

  const handleVerify = (verified: boolean) => {
    if (verified) {
      sessionStorage.setItem("flenjure_age_verified", "true");
      setShowAgeModal(false);
      document.body.style.overflow = "auto";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      <AnimatePresence>
        {showAgeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/90 backdrop-blur-xl px-6"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="w-full max-w-md bg-stone-900 border border-stone-800 p-12 text-center shadow-2xl flex flex-col items-center gap-8"
            >
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-amber-500 block">Verification</span>
                <h2 className="text-3xl font-serif font-light text-white">Are you 21 years or older?</h2>
                <p className="text-stone-400 text-xs uppercase tracking-widest font-mono leading-relaxed mt-4">
                  You must be of legal age to enter the Cafe section.
                </p>
              </div>

              <div className="flex w-full gap-4 mt-4">
                <button 
                  onClick={() => handleVerify(false)}
                  className="flex-1 py-4 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white text-[10px] uppercase tracking-[0.3em] font-bold transition-all"
                >
                  No, I am not
                </button>
                <button 
                  onClick={() => handleVerify(true)}
                  className="flex-1 py-4 bg-amber-500 text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-amber-400 transition-colors"
                >
                  Yes, I am
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen pt-40 pb-40 px-6 lg:px-12 bg-[#fcfcfc] dark:bg-[#0a0a0a] transition-colors duration-1000">
        <div className="max-w-5xl mx-auto w-full">
          
          {/* Restaurant Header */}
          <div className="flex flex-col items-center justify-center mb-24 lg:mb-32 gap-6 text-center">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-[10px] uppercase tracking-[0.4em] font-medium text-stone-400 dark:text-stone-500"
            >
              Le Menu
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-6xl md:text-8xl lg:text-9xl font-serif font-light tracking-tight text-stone-900 dark:text-white"
            >
              LE CAFÉ
            </motion.h1>
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 40 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="w-[1px] bg-stone-300 dark:bg-stone-800 mt-8" 
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="flex flex-col gap-32"
          >
             {/* Desserts Grid - aspect-[4/5] */}
             {items.filter(item => item.category === "Desserts").length > 0 && (
               <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 max-w-4xl mx-auto">
                     {items.filter(item => item.category === "Desserts").map(item => (
                       <MenuItem key={item.id} item={item} aspect="aspect-[4/5]" />
                     ))}
                  </div>
               </section>
             )}

             {items.filter(item => item.category === "Desserts").length > 0 && items.filter(item => item.category === "Munchies" || item.category === "Drinks").length > 0 && (
               <div className="w-full flex justify-center">
                 <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" />
               </div>
             )}

             {/* Munchies & Drinks Grid - aspect-square */}
             {items.filter(item => item.category === "Munchies" || item.category === "Drinks").length > 0 && (
               <section>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 max-w-5xl mx-auto">
                     {items.filter(item => item.category === "Munchies" || item.category === "Drinks").map(item => (
                       <MenuItem key={item.id} item={item} aspect="aspect-square" />
                     ))}
                  </div>
               </section>
             )}

             {items.length === 0 && (
               <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 max-w-4xl mx-auto opacity-50">
                     <MenuItem item={{ id: "f-fruit-snacks", name: "Fleñjure Fruit Snacks", price: "$100", image: "/images/cafe_placeholder.png" }} aspect="aspect-[4/5]" />
                     <MenuItem item={{ id: "f-mazzines", name: "Fleñjure Mazzines", price: "$100", image: "/images/cafe_placeholder.png" }} aspect="aspect-[4/5]" />
                  </div>
                  <div className="w-full flex justify-center my-20">
                    <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800 opacity-50" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 max-w-5xl mx-auto opacity-50">
                    <MenuItem item={{ id: "m-lays", name: "Lays", price: "$10", image: "/images/cafe_placeholder.png" }} aspect="aspect-square" />
                  </div>
               </section>
             )}
          </motion.div>

        </div>
      </div>
    </>
  );
}

// Minimalist, high-end gallery item
function MenuItem({ item, aspect }: { item: any, aspect: string }) {
  const addItem = useCartStore((state) => state.addItem);
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const [isOpen, setIsOpen] = useState(false);
  const hasVariants = item.variants && item.variants.length > 0;
  
  const handleAdd = (e: React.MouseEvent, size: string = 'OS', customPrice?: string) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      price: customPrice || item.price,
      image: item.image_urls?.[0] || item.image || "/images/cafe_placeholder.png",
      size,
      quantity: 1,
      isCafe: true
    });
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col group relative">
       <Link href={`/cafe/${item.id}`} className="cursor-pointer">
         <div className={`relative ${aspect} w-full bg-[#f8f8f8] dark:bg-stone-900 mb-6 overflow-hidden`}>
            <Image 
              src={item.image_urls?.[0] || item.image || "/images/cafe_placeholder.png"} 
              alt={item.name} 
              fill 
              className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100" 
            />
         </div>
         <div className="flex justify-between items-start gap-4 px-1">
            <h3 className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] text-stone-900 dark:text-white leading-relaxed max-w-[80%]">
              {item.name}
            </h3>
            <span className="text-[11px] md:text-[12px] text-stone-500 font-light flex-shrink-0 tracking-widest">
              {formatPrice(item.price)}
            </span>
         </div>
       </Link>
       <div className="px-1 mt-3 mb-2 overflow-hidden h-[24px]">
          <button 
             onClick={(e) => {
               e.preventDefault();
               if (hasVariants) {
                 setIsOpen(true);
               } else {
                 handleAdd(e, 'OS');
               }
             }}
             className="block text-[9px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2"
          >
             <Plus size={10} /> Add to Order
          </button>
       </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-10 left-2 right-2 z-30 bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-3 rounded-sm flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
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
            
            <div className="flex flex-wrap gap-1">
              {item.variants.map((v: any, idx: number) => {
                const label = v.size + (v.color ? ` - ${v.color}` : '');
                const variantPrice = v.price && String(v.price).trim() !== "" ? `$${Number(v.price).toFixed(2)}` : undefined;
                return (
                  <button
                    key={idx}
                    onClick={(e) => handleAdd(e, label, variantPrice)}
                    className="flex-1 min-w-[32px] h-8 px-2 text-[10px] font-medium border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all flex items-center justify-center bg-white text-stone-900"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
