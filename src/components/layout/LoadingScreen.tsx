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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F9F9F9]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1, 0.95],
              opacity: [0, 1, 1]
            }}
            transition={{ 
              duration: 2, 
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }}
            className="relative w-24 h-24"
          >
            <Image
              src="/favicon.png"
              alt="Fleñjure Loading"
              fill
              className="object-contain"
              sizes="96px"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
