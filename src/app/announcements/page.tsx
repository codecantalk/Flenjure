"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementsPage() {
  const announcements = [
    {
      title: "Spring/Summer 2026: The Uniform of Joy",
      date: "April 24, 2026",
      category: "Releases",
      excerpt: "Establishing the core silhouettes for the upcoming season, focusing on superior drape, raw textures, and effortless transition.",
      fullContent: "The Spring/Summer 2026 collection 'The Uniform of Joy' redefines everyday elegance through a series of elevated essentials. By incorporating premium, lightweight materials that offer superior drape, we've designed pieces that move with the wearer. The color palette draws from nature's most vivid moments—sun-bleached terracotta, deep ocean blues, and crisp cotton whites. Each garment is meticulously tailored to ensure a flawless fit while maintaining a relaxed, effortless attitude that transitions seamlessly from day to night."
    },
    {
      title: "Refining the Digital Flagship Experience",
      date: "April 18, 2026",
      category: "News",
      excerpt: "An inside look at our transition to a clinical ALD-standard funnel architecture, prioritizing clarity and premium conversion.",
      fullContent: "At Flenjure, we believe the digital experience should be as tactile and deliberate as holding our garments in person. Our recent transition to a clinical, high-conversion architecture is designed to eliminate friction while elevating aesthetic presentation. We've stripped away visual noise, focusing entirely on the product, high-resolution imagery, and seamless typography. This refined funnel not only guides our customers effortlessly from discovery to checkout but also reinforces our commitment to premium design principles at every touchpoint."
    },
    {
      title: "Coinbase Commerce: Crypto at Flenjure",
      date: "March 12, 2026",
      category: "Partnerships",
      excerpt: "Deepening our commitment to modern digital ownership by integrating secure, global crypto payment gateways.",
      fullContent: "The future of commerce is borderless. We are thrilled to announce our partnership with Coinbase Commerce, enabling Flenjure to accept a wide range of cryptocurrencies for all transactions. This integration represents a significant step in our commitment to modern digital ownership and global accessibility. Whether you're purchasing our latest collection or securing a limited-edition accessory, you can now transact with confidence and speed using your preferred digital assets. This is more than a payment option; it's an alignment with the forward-thinking lifestyle of our community."
    }
  ];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
              onClick={() => toggleExpand(i)}
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
                
                <AnimatePresence initial={false}>
                  {expandedIndex === i ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 pb-8 space-y-6">
                        <p className="text-sm md:text-base font-light text-stone-800 dark:text-stone-200 leading-relaxed border-l-2 border-stone-900 dark:border-white pl-6">
                          {item.fullContent}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm md:text-base font-light text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                        {item.excerpt}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-900 dark:text-white">
                    {expandedIndex === i ? "Close Article" : "Read Article"}
                  </span>
                  <div className={`h-px bg-stone-900 dark:bg-white transition-all duration-700 ease-in-out ${expandedIndex === i ? 'w-20' : 'w-0 group-hover:w-20'}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
