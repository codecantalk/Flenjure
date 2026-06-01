"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAnnouncements } from "@/app/admin/actions";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  full_content: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await getAnnouncements();
      setAnnouncements(data as Announcement[]);
    }
    fetchAnnouncements();

    const channel = supabase.channel('realtime:public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchAnnouncements();
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

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
                          {item.full_content}
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
