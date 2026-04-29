"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import clsx from "clsx";

export default function ThemeSplash() {
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    // Check if user has explicitly selected a theme before
    const hasSelectedTheme = localStorage.getItem("flenjure-theme-selected");
    
    // Only show splash if they have never selected a theme
    if (!hasSelectedTheme) {
      // Delay slightly for dramatic effect
      const timer = setTimeout(() => {
        setShowSplash(true);
        // Force document body overflow hidden while splash is active
        document.body.style.overflow = "hidden";
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelection = (selectedTheme: "dark" | "light") => {
    setTheme(selectedTheme);
    localStorage.setItem("flenjure-theme-selected", "true");
    setShowSplash(false);
    document.body.style.overflow = "auto";
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#fcfcfc] dark:bg-stone-900 transition-colors duration-1000"
        >
          {/* Light Mode Choice */}
          <button
            onClick={() => handleSelection("light")}
            onMouseEnter={() => setTheme("light")}
            className="flex-1 h-full flex flex-col items-center justify-center gap-6 group relative overflow-hidden bg-[#fcfcfc] text-stone-900 border-b md:border-b-0 md:border-r border-stone-200 transition-colors duration-700"
          >
            <div className="absolute inset-0 bg-stone-100/50 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" />
            <Sun size={48} strokeWidth={1} className="z-10 group-hover:scale-110 transition-transform duration-500" />
            <span className="z-10 uppercase tracking-[0.3em] text-xs font-medium">Light Mode</span>
          </button>

          {/* Dark Mode Choice */}
          <button
            onClick={() => handleSelection("dark")}
            onMouseEnter={() => setTheme("dark")}
            className="flex-1 h-full flex flex-col items-center justify-center gap-6 group relative overflow-hidden bg-stone-900 text-stone-50 transition-colors duration-700"
          >
            <div className="absolute inset-0 bg-stone-800/50 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" />
            <Moon size={48} strokeWidth={1} className="z-10 group-hover:scale-110 transition-transform duration-500 text-stone-300 group-hover:text-stone-50" />
            <span className="z-10 uppercase tracking-[0.3em] text-xs font-medium text-stone-300 group-hover:text-stone-50 transition-colors duration-500">Dark Mode</span>
          </button>

          {/* Absolute Center Branding */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center gap-4 mix-blend-difference text-white">
            <h1 className="font-serif text-3xl md:text-5xl tracking-widest uppercase font-light">Fleñjure</h1>
            <p className="uppercase tracking-[0.4em] text-[10px] md:text-xs">Select your aesthetic</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
