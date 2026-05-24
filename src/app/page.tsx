"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync state with DOM ref to bypass aggressive iOS Safari autoplay blocks
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-900">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
      >
        <source src="/New-home-screen-video.mp4" type="video/mp4" />
      </video>

      {/* Volume Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-8 right-8 md:bottom-32 md:right-16 z-30 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-500"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <AnimatePresence mode="wait">
          {isMuted ? (
            <motion.div
              key="muted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <VolumeX size={18} strokeWidth={1.5} />
            </motion.div>
          ) : (
            <motion.div
              key="unmuted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Volume2 size={18} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Subtle Overlay gradients for legibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30" />

      {/* Main Content Interface */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between p-8 lg:p-16 pt-32">
        
        {/* Entrance Controls */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-12 mt-auto">
          
          <div className="flex flex-col gap-8">

            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 2, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col sm:flex-row gap-6 items-center"
            >
              <Link
                href="/shop"
                className="group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden border border-white/30 bg-white/5 backdrop-blur-md px-12 py-5 text-stone-50 transition-all duration-700 hover:border-white"
              >
                <div className="absolute inset-0 translate-y-[101%] bg-white transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
                <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] font-bold transition-colors duration-700 group-hover:text-stone-900">
                  Enter Store
                </span>
              </Link>
              
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="group flex items-center gap-4 uppercase tracking-[0.3em] text-[10px] font-bold text-white/70 hover:text-white transition-colors duration-500 py-4"
              >
                Become a Member
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
              </button>
            </motion.div>
          </div>
          
          {/* Subtle footer markings */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 2.5 }}
            className="hidden md:flex flex-col text-white/40 text-[10px] uppercase tracking-widest text-right gap-2"
          >
            <span>Est. 2020</span>
            <span>Atlanta, GA</span>
          </motion.div>
        </div>
      </div>

      {/* Membership Modal */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-stone-950/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="relative w-full max-w-md bg-white p-10 md:p-12 shadow-2xl flex flex-col gap-8"
            >
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1} />
              </button>

              <div className="flex flex-col gap-2 text-center">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400">Join the Club</span>
                <h3 className="font-serif text-3xl font-light text-stone-900">Private Membership</h3>
                <p className="text-stone-500 text-sm mt-2 font-light">Get exclusive access to drops, free gifts, and private events.</p>
              </div>

              <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 outline-none focus:border-stone-900 transition-colors font-light text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="snapchat" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Snapchat (Optional)</label>
                  <input
                    type="text"
                    id="snapchat"
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 outline-none focus:border-stone-900 transition-colors font-light text-sm"
                    placeholder="@username"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="whatsapp" className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">WhatsApp Number (Optional)</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 outline-none focus:border-stone-900 transition-colors font-light text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <button
                  type="submit"
                  className="mt-4 group relative w-full flex items-center justify-center overflow-hidden border border-stone-900 bg-stone-900 px-8 py-4 text-white transition-all duration-700"
                >
                  <div className="absolute inset-0 translate-y-[101%] bg-white transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
                  <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] font-bold transition-colors duration-700 group-hover:text-stone-900">
                    Submit Request
                  </span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
