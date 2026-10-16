"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Elegant timing: Show for 2 seconds then fade out
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fcfcfc] dark:bg-[#0a0a0a]"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ 
              scale: [0.85, 1, 0.98],
              opacity: [0, 1, 1]
            }}
            transition={{ 
              duration: 2, 
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative w-48 h-16 sm:w-60 sm:h-20">
              <Image
                src="/logo-black.png"
                alt="Fleñjure Loading"
                fill
                className="object-contain dark:hidden"
                sizes="(max-width: 640px) 192px, 240px"
                priority
              />
              <Image
                src="/logo-white.png"
                alt="Fleñjure Loading"
                fill
                className="object-contain hidden dark:block"
                sizes="(max-width: 640px) 192px, 240px"
                priority
              />
            </div>
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-[10px] uppercase tracking-[0.35em] font-light text-stone-500 dark:text-stone-400"
            >
              On ne vit qu’une fois
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
