"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-white pt-24">
      {/* Header Section */}
      <section className="w-full py-24 md:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">Philosophy</span>
            <h1 className="font-serif text-5xl md:text-8xl font-light tracking-tight leading-tight">
              Enjoy <span className="italic text-stone-400">Carefree</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl text-stone-600 text-lg md:text-xl font-light leading-relaxed font-serif italic italic-stone-400"
          >
            “FLEÑJURE roughly translates to, ‘living carefree without consideration, with genuineness and purity in your thoughts and actions’. It’s an elevated experience encouraging you to embrace not just your life, not just in its troubles and complexities but its simplicity and everythingness.”
          </motion.p>
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="flex flex-col items-center gap-2 mt-8"
          >
            <p className="text-stone-400 text-xs tracking-widest uppercase">Your experiences do define YOU. Make them the highest quality ones.</p>
            <h3 className="text-2xl font-serif font-light mt-8">Questions/Feedback About the Club?</h3>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="w-full pb-32 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-3">
              <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">FullName</label>
              <input
                type="text"
                id="name"
                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700 font-light text-stone-900 dark:text-white"
                placeholder="Enter your name"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">EmailAddress</label>
              <input
                type="email"
                id="email"
                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700 font-light text-stone-900 dark:text-white"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label htmlFor="subject" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Subject</label>
              <select
                id="subject"
                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors font-light appearance-none text-stone-900 dark:text-white [&>option]:text-stone-900"
              >
                <option value="general">General Inquiry</option>
                <option value="custom">Custom Packaging</option>
                <option value="wholesale">Wholesale</option>
                <option value="press">Press & PR</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Message</label>
              <textarea
                id="message"
                rows={5}
                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700 font-light resize-none text-stone-900 dark:text-white"
                placeholder="How can we help?"
              />
            </div>
            <div className="md:col-span-2 flex justify-center pt-8">
              <button
                type="submit"
                className="group flex items-center justify-center gap-6 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-16 py-6 uppercase tracking-[0.4em] text-[10px] font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">Send Message</span>
                <div className="absolute inset-0 bg-stone-700 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Info Section */}
      <section className="w-full py-24 bg-stone-50 dark:bg-stone-900/30 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Social</span>
            <div className="flex flex-col md:flex-row gap-4">
              <Link href="https://instagram.com" className="hover:text-stone-400 transition-colors">Instagram</Link>
              <Link href="https://twitter.com" className="hover:text-stone-400 transition-colors">Twitter</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Location</span>
            <p className="text-stone-900 dark:text-white font-light uppercase tracking-widest text-[10px]">Smyrna, Georgia</p>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
