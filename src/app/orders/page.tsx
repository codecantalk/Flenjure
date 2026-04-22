"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fcfcfc] items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-6"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">History</span>
        <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight">
          Track <span className="italic text-stone-400">Order</span>
        </h1>
        <p className="text-stone-500 font-light mt-4 max-w-md">
          Please refer to the tracking link sent to your email after your invoice was fulfilled. For further assistance, contact support.
        </p>
        <Link href="/contact" className="mt-8 px-8 py-3 bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-800 transition-all duration-300">
            Get Help
        </Link>
      </motion.div>
    </div>
  );
}
