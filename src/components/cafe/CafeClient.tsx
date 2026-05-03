"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/store";
import { Plus } from "lucide-react";

const MENU_DATA = {
  desserts: [
    { id: "f-fruit-snacks", name: "Fleñjure Fruit Snacks (P S/S 26, L F/W 26)", price: "$100", image: "/images/cafe_placeholder.png" },
    { id: "f-mazzines", name: "Fleñjure Mazzines", price: "$100", image: "/images/cafe_placeholder.png" },
  ],
  munchies: [
    { id: "m-lays", name: "Lays", price: "$10", image: "/images/cafe_placeholder.png" },
    { id: "m-doritos", name: "Doritos", price: "$10", image: "/images/cafe_placeholder.png" },
    { id: "m-cheetos", name: "Cheetos", price: "$10", image: "/images/cafe_placeholder.png" },
    { id: "m-sour-patch", name: "Sour Patch", price: "$10", image: "/images/cafe_placeholder.png" },
    { id: "m-welches", name: "Welches", price: "$10", image: "/images/cafe_placeholder.png" },
    { id: "m-haribos", name: "Haribos", price: "$10", image: "/images/cafe_placeholder.png" },
  ]
};

export default function CafeClient() {
  return (
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
           {/* Section: Desserts */}
           <section>
              <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase font-light text-stone-900 dark:text-stone-100 mb-16 text-center border-b border-stone-200 dark:border-stone-800 pb-8 w-max mx-auto px-12">Desserts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 max-w-4xl mx-auto">
                 {MENU_DATA.desserts.map(item => <MenuItem key={item.id} item={item} aspect="aspect-[4/5]" />)}
              </div>
           </section>

           <div className="w-full flex justify-center">
              <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" />
           </div>

           {/* Section: Munchies */}
           <section>
              <h2 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase font-light text-stone-900 dark:text-stone-100 mb-16 text-center border-b border-stone-200 dark:border-stone-800 pb-8 w-max mx-auto px-12">Munchies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                 {MENU_DATA.munchies.map(item => <MenuItem key={item.id} item={item} aspect="aspect-square" />)}
              </div>
           </section>
        </motion.div>

      </div>
    </div>
  );
}

// Minimalist, high-end gallery item
function MenuItem({ item, aspect }: { item: any, aspect: string }) {
  const addItem = useCartStore((state) => state.addItem);
  
  return (
    <div 
      className="flex flex-col group cursor-pointer" 
      onClick={() => addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: 'OS',
        quantity: 1
      })}
    >
       <div className={`relative ${aspect} w-full bg-[#f8f8f8] dark:bg-stone-900 mb-6 overflow-hidden`}>
          <Image 
            src={item.image} 
            alt={item.name} 
            fill 
            className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100" 
          />
       </div>
       <div className="flex justify-between items-start gap-4 px-1">
          <h3 className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] text-stone-900 dark:text-stone-200 leading-relaxed max-w-[80%]">
            {item.name}
          </h3>
          <span className="text-[11px] md:text-[12px] text-stone-500 font-light flex-shrink-0 tracking-widest">
            {item.price}
          </span>
       </div>
       <div className="px-1 mt-3 overflow-hidden h-[20px]">
          <span className="block text-[9px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2">
             <Plus size={10} /> Add to Order
          </span>
       </div>
    </div>
  )
}
