"use client";

import { motion } from "framer-motion";

export default function EditorialPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fcfcfc] items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-6"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">Journal</span>
        <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight">
          Editorial <span className="italic text-stone-400">Coming Soon</span>
        </h1>
        <p className="text-stone-500 font-light mt-4 max-w-md">
          Stories, interviews, and visual diaries. The Fleñjure journal is currently being written.
        </p>
      </motion.div>
    </div>
  );
}
