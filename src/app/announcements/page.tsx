"use client";

import { motion } from "framer-motion";

export default function AnnouncementsPage() {
  const announcements = [
    {
      title: "Spring/Summer 2026: The Uniform of Joy",
      date: "April 24, 2026",
      category: "Releases",
      excerpt: "Establishing the core silhouettes for the upcoming season, focusing on superior drape, raw textures, and effortless transition."
    },
    {
      title: "Refining the Digital Flagship Experience",
      date: "April 18, 2026",
      category: "News",
      excerpt: "An inside look at our transition to a clinical ALD-standard funnel architecture, prioritizing clarity and premium conversion."
    },
    {
      title: "Coinbase Commerce: Crypto at Flenjure",
      date: "March 12, 2026",
      category: "Partnerships",
      excerpt: "Deepening our commitment to modern digital ownership by integrating secure, global crypto payment gateways."
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-white dark:bg-stone-950 transition-colors duration-1000">
      <div className="max-w-[1200px] mx-auto w-full">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2 }}
           className="text-center mb-32"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] text-stone-400 mb-6 block">The Dispatch</span>
          <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tight text-stone-900 dark:text-white uppercase">
            Announce<span className="italic text-stone-400">ments</span>
          </h1>
        </motion.div>

        <div className="flex flex-col gap-px bg-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
          {announcements.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 1 }}
              className="bg-white dark:bg-stone-950 p-8 md:p-16 group hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors cursor-pointer flex flex-col md:flex-row gap-8 md:gap-24 items-start"
            >
              <div className="flex flex-col gap-2 min-w-[200px]">
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-stone-400">{item.date}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-stone-300 dark:text-stone-600">{item.category}</span>
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <h2 className="text-3xl md:text-5xl font-serif font-light text-stone-900 dark:text-white group-hover:text-stone-400 transition-colors duration-700">
                  {item.title}
                </h2>
                <p className="text-sm md:text-base font-light text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                  {item.excerpt}
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-900 dark:text-white">Read Article</span>
                  <div className="h-px w-0 group-hover:w-20 bg-stone-900 dark:bg-white transition-all duration-700 ease-in-out" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
