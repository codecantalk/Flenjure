"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fcfcfc] items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-6"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">Portal</span>
        <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight">
          Client <span className="italic text-stone-400">Login</span>
        </h1>
        <p className="text-stone-500 font-light mt-4 max-w-md">
          Portal access is currently restricted to approved retail partners only. For wholesale inquiries, please reach out via our contact page.
        </p>
        <Link href="/contact" className="mt-8 px-8 py-3 border border-stone-900 text-stone-900 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-900 hover:text-white transition-all duration-300">
            Contact Wholesale
        </Link>
      </motion.div>
    </div>
  );
}
