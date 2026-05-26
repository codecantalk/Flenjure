"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export default function LookbookPage() {
  const containerRef = useRef(null);
  
  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-white dark:bg-stone-950 transition-colors duration-1000">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="text-center mb-32"
        >
          <p className="mt-8 text-stone-500 dark:text-stone-400 font-light text-sm max-w-lg mx-auto leading-relaxed uppercase tracking-widest">
            Spring/Summer 2026 Looks
          </p>
        </motion.div>

        {/* Vertical Editorial Flow */}
        <div className="flex flex-col gap-48 w-full max-w-5xl">
          <LookbookSection 
            image="/images/flenjure_lookbook_1_1777310682790.png" 
            title="Look 001" 
            details="Jersey Fleece Hoodie in Bone with matching Cotton Twill Trousers."
            reverse={false}
          />
          <LookbookSection 
            image="/images/flenjure_lookbook_3_1777310726550.png" 
            title="Look 002" 
            details="Signature Heavyweight Tote and Overdyed Canvas Jacket."
            reverse={true}
          />
          <LookbookSection 
            image="/images/flenjure_lookbook_2_1777310705555.png" 
            title="Look 003" 
            details="Cafe Essentials: Logo Porcelain Cup and Sourced Leather Accessories."
            reverse={false}
          />
        </div>

        <div className="mt-48 text-center">
           <Link href="/shop" className="border border-stone-900 dark:border-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-stone-900 dark:text-white hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
              Shop the Collection
           </Link>
        </div>
      </div>
    </div>
  );
}

function LookbookSection({ image, title, details, reverse }: any) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const yImage = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const yText = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <div ref={ref} className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-24 items-center`}>
      <div className="flex-1 w-full bg-[#f8f8f8] dark:bg-stone-900 group overflow-hidden shadow-2xl">
        <motion.div style={{ y: yImage }} className="relative aspect-[3/4] w-full scale-110">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
      </div>
      <motion.div style={{ y: yText }} className="flex-1 flex flex-col gap-6 text-center lg:text-left px-8">
        <span className="text-[10px] uppercase tracking-[0.4em] text-stone-300 dark:text-stone-700 font-bold">{title}</span>
        <h2 className="text-3xl md:text-5xl font-serif font-light text-stone-900 dark:text-white uppercase leading-tight">{title} <br/><span className="italic text-stone-400">Atmosphere</span></h2>
        <p className="text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm uppercase tracking-widest">{details}</p>
        <div className="w-12 h-px bg-stone-200 dark:bg-stone-800 hidden lg:block" />
      </motion.div>
    </div>
  );
}
