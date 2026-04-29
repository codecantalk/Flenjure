"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function CollectionsPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-white dark:bg-stone-950 transition-colors duration-1000">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
           className="text-center mb-32"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] text-stone-400 mb-6 block">Archive</span>
          <h1 className="text-5xl md:text-9xl font-serif font-light tracking-tight text-stone-900 dark:text-white uppercase leading-none">
            Collect<span className="italic text-stone-400">ions</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-1 gap-y-24 w-full">
           <CollectionItem 
             title="Summer Staples" 
             category="Editorial" 
             image="/Users/arko/.gemini/antigravity/brain/c78f13b9-acd2-4fb5-9566-f0ab9652dea5/flenjure_lookbook_1_1777310682790.png"
             link="/shop"
             delay={0}
           />
           <CollectionItem 
             title="Le Café Objects" 
             category="Lifestyle" 
             image="/Users/arko/.gemini/antigravity/brain/c78f13b9-acd2-4fb5-9566-f0ab9652dea5/flenjure_lookbook_2_1777310705555.png"
             link="/cafe"
             delay={0.2}
           />
           <CollectionItem 
             title="Monochrome Capsule" 
             category="Limited" 
             image="/Users/arko/.gemini/antigravity/brain/c78f13b9-acd2-4fb5-9566-f0ab9652dea5/flenjure_lookbook_3_1777310726550.png"
             link="/shop"
             delay={0.1}
           />
           <CollectionItem 
             title="Global Essentials" 
             category="Core" 
             image="/logo.png"
             link="/shop"
             delay={0.3}
             isLogo
           />
        </div>
      </div>
    </div>
  );
}

function CollectionItem({ title, category, image, link, delay, isLogo }: any) {
  const ref = useRef(null);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1 }}
      viewport={{ once: true }}
    >
      <Link href={link} className="group relative block w-full aspect-[4/5] overflow-hidden bg-stone-50 dark:bg-stone-900 shadow-sm border border-stone-100 dark:border-stone-800">
        <Image
          src={image}
          alt={title}
          fill
          className={isLogo ? "object-contain p-24 opacity-20" : "object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/70 mb-2">{category}</span>
          <h2 className="text-4xl font-serif font-light text-white uppercase tracking-wider">{title}</h2>
        </div>
      </Link>
      <div className="flex justify-between items-center mt-6 px-2">
         <h3 className="text-sm font-serif text-stone-900 dark:text-white uppercase tracking-widest">{title}</h3>
         <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">Explore →</span>
      </div>
    </motion.div>
  );
}
