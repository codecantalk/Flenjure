"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/store";
import { Plus } from "lucide-react";

export default function CafeClient({ products }: { products: any[] }) {
  const addItem = useCartStore((state) => state.addItem);

  // Filter ONLY snacks (including candy/chips)
  const cafeItems = products.filter(p => !p.category || p.category.toLowerCase().includes("snack") || p.category.toLowerCase().includes("candy"));

  // Sort into Restaurant Tiers based on brand
  const desserts = cafeItems.filter(p => p.name.toLowerCase().includes("flenjure"));
  const munchies = cafeItems.filter(p => !p.name.toLowerCase().includes("flenjure"));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <div className="flex flex-col min-h-screen pt-40 pb-32 px-6 lg:px-12 bg-[#fcfcfc] dark:bg-stone-900 transition-colors duration-1000">
      <div className="max-w-4xl mx-auto w-full">
        {/* Restaurant Header */}
        <div className="flex flex-col items-center justify-center mb-32 gap-6 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-stone-400 dark:text-stone-500">Menu</span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-serif font-light tracking-tight text-stone-900 dark:text-white"
          >
            LE CAFÉ
          </motion.h1>
          <div className="w-12 h-[1px] bg-stone-300 dark:bg-stone-700 mt-4" />
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
          className="flex flex-col gap-32"
        >
          {/* Section: Desserts */}
          {desserts.length > 0 && (
            <section className="flex flex-col items-center w-full">
              <h2 className="text-3xl md:text-4xl font-serif font-light italic text-stone-900 dark:text-stone-50 mb-16 text-center">
                Desserts
              </h2>
              <div className="w-full flex flex-col gap-12">
                {desserts.map((item) => (
                  <RestaurantItem key={item.id} item={item} addItem={addItem} />
                ))}
              </div>
            </section>
          )}

          {/* Section: Munchies */}
          {munchies.length > 0 && (
            <section className="flex flex-col items-center w-full">
              <div className="flex items-center gap-4 w-full justify-center mb-16">
                <div className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
                <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 dark:text-stone-50 px-8">
                  Munchies
                </h2>
                <div className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 w-full">
                {munchies.map((item) => (
                  <RestaurantItem key={item.id} item={item} addItem={addItem} />
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Reusable Restaurant Item Component with Photo
function RestaurantItem({ item, addItem }: { item: any, addItem: any }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } }
      }}
      className="group relative flex flex-row items-center gap-6 pb-6 border-b border-stone-100 dark:border-stone-800/50"
    >
      <Link href={`/shop/${item.id}`} className="block relative w-24 h-24 md:w-32 md:h-32 bg-stone-100 dark:bg-stone-800 overflow-hidden rounded-sm flex-shrink-0">
        <Image 
          src={item.image} 
          alt={item.name} 
          fill 
          className="object-contain mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-700" 
        />
      </Link>
      
      <div className="flex flex-col flex-1 justify-center gap-2">
        <div className="flex justify-between items-start gap-4">
          <Link href={`/shop/${item.id}`} className="text-lg md:text-xl font-serif text-stone-900 dark:text-stone-100 hover:text-stone-500 transition-colors">
            {item.name}
          </Link>
          <span className="text-base md:text-lg font-light tracking-widest text-stone-900 dark:text-white flex-shrink-0">
            {item.price}
          </span>
        </div>
        <p className="text-sm font-light text-stone-500 dark:text-stone-400 line-clamp-2 pr-8 leading-relaxed">
          {item.description || "A delectable selection from our exclusive catalog."}
        </p>
        <button 
          onClick={(e) => {
            e.preventDefault();
            addItem({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              size: item.sizes?.[0] || 'OS',
              quantity: 1
            });
          }}
          className="flex items-center gap-2 mt-4 text-[10px] uppercase font-bold tracking-[0.2em] text-stone-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Plus size={12} strokeWidth={2} /> Add to Order
        </button>
      </div>
    </motion.div>
  );
}
