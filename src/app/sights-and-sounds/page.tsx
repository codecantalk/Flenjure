"use client";

import { motion } from "framer-motion";
import { Play, Music, Volume2 } from "lucide-react";

export default function SightsAndSoundsPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-white dark:bg-stone-950 transition-colors duration-1000 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2 }}
           className="mb-24"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-stone-400 mb-4 block">S/S26 ‘Breath of Fresh Air’ Campaign</span>
          <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tight text-stone-900 dark:text-white uppercase leading-none">
            Sights <br />& <span className="italic text-stone-400 text-6xl md:text-9xl">Sounds</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Featured Video Block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="lg:col-span-8 group relative aspect-video bg-stone-900 overflow-hidden rounded-sm cursor-pointer shadow-2xl"
          >
            <video 
              autoPlay 
              muted 
              loop 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000"
              src="/FlenjureFinalr.mp4"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <Play className="text-white fill-white ml-1" size={24} />
              </div>
            </div>
            <div className="absolute bottom-8 left-8">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-medium">Flagship Concept 2026</span>
            </div>
          </motion.div>

          {/* Curated Audio List */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            <div className="flex flex-col gap-8">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-4">Curated Audio</h3>
              
              <AudioTrack 
                number="01" 
                title="Smyrna Jazz Sessions" 
                length="42:15" 
                tag="Spotify" 
              />
              <AudioTrack 
                number="02" 
                title="Morning Espresso Mix" 
                length="58:00" 
                tag="Apple Music" 
              />
              <AudioTrack 
                number="03" 
                title="Late Night Essentials" 
                length="1:15:20" 
                tag="Soundcloud" 
              />
            </div>

            <div className="p-8 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 rounded-sm">
               <Volume2 size={24} strokeWidth={1} className="text-stone-400 mb-6" />
               <p className="text-sm font-light text-stone-600 dark:text-stone-400 leading-relaxed italic">
                 "Our sensory extensions are designed to bridge the gap between the physical and digital, creating an atmosphere that resonates with the Flenjure lifestyle."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AudioTrack({ number, title, length, tag }: { number: string, title: string, length: string, tag: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex items-center gap-6 group cursor-pointer border-b border-stone-100 dark:border-stone-900 pb-6 hover:translate-x-2 transition-transform duration-500"
    >
      <span className="text-[10px] font-mono text-stone-300 dark:text-stone-700">{number}</span>
      <div className="flex-1 flex flex-col gap-1">
        <h4 className="text-lg font-serif font-light text-stone-900 dark:text-white group-hover:text-stone-400 transition-colors uppercase tracking-wider">{title}</h4>
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-stone-400">
           <span>{length}</span>
           <span className="w-4 h-[1px] bg-stone-200 dark:bg-stone-800" />
           <span>{tag}</span>
        </div>
      </div>
      <Music size={16} strokeWidth={1} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
