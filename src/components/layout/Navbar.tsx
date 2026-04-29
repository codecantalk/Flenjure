"use client";

import { useState, useEffect } from "react";
import { Menu, Search, ShoppingBag, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store";
import SearchOverlay from "../search/SearchOverlay";
import { useTheme } from "next-themes";

const mainLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Café", href: "/cafe" },
  { name: "Lookbook", href: "/lookbook" },
  { name: "Sights and Sounds", href: "/sights-and-sounds" },
  { name: "Announcements", href: "/announcements" },
  { name: "Account", href: "/account" },
];

const discoverLinks = [
  { name: "New Arrivals", href: "/shop" },
  { name: "Cafe", href: "/cafe" },
  { name: "Collections", href: "/collections" },
  { name: "Shop All", href: "/shop" },
];

const categoryLinks = [
  { name: "T-Shirts", href: "/shop" },
  { name: "Shorts", href: "/shop" },
  { name: "Tank Tops", href: "/shop" },
  { name: "Hats and Headgear", href: "/shop" },
  { name: "Candy Shop", href: "/cafe" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isStudio = pathname.startsWith("/studio");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items, setIsOpen: setCartOpen } = useCartStore();
  const { theme, setTheme } = useTheme();
  
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Mouse activity timer for cinematic homepage header
  useEffect(() => {
    if (!isHome) return;

    let inactivityTimer: NodeJS.Timeout;

    const handleMouseMove = () => {
      setIsMouseActive(true);
      
      clearTimeout(inactivityTimer);
      
      // Auto-hide after 2.5 seconds of no movement
      inactivityTimer = setTimeout(() => {
        setIsMouseActive(false);
      }, 2500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    // Initial trigger to show it when page first loads
    handleMouseMove();
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(inactivityTimer);
    };
  }, [isHome]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  if (isStudio) return null;

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
          isScrolled
            ? "bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg py-4 border-b border-stone-100 dark:border-stone-800"
            : (isHome ? "bg-transparent py-8" : "bg-[#fcfcfc] dark:bg-stone-900 py-6 border-b border-stone-50 dark:border-stone-800"),
          isHome && !isMouseActive && !isScrolled && !isMenuOpen && !isSearchOpen
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100 pointer-events-auto"
        )}
      >
        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-3 items-center">
          {/* Left: Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className={clsx(
                "group flex items-center gap-3 transition-all duration-300 hover:opacity-50",
                isHome && !isScrolled ? "text-white" : "text-stone-900 dark:text-stone-50"
              )}
              aria-label="Open menu"
            >
              <div className="relative w-6 h-4 flex flex-col justify-between">
                <span className="w-full h-[1px] bg-current transition-transform duration-500" />
                <span className="w-full h-[1px] bg-current transition-transform duration-500" />
                <span className="w-full h-[1px] bg-current transition-transform duration-500" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-light hidden sm:block">
                Menu
              </span>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <Link
              href="/"
              className={clsx(
                "relative h-10 w-40 sm:h-12 sm:w-48 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]",
                isHome && !isScrolled ? "invert-0 brightness-[10]" : "invert"
              )}
            >
              <Image
                src="/logo.png"
                alt="Fleñjure Logo"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right: Tools */}
          <div className={clsx(
            "flex items-center justify-end gap-2 md:gap-4 transition-colors duration-700",
            isHome && !isScrolled ? "text-white" : "text-stone-900 dark:text-stone-50"
          )}>
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 transition-opacity duration-300 hover:opacity-50" 
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1} />
              </button>
              <Link 
                href="/account" 
                className="p-2 transition-opacity duration-300 hover:opacity-50" 
                aria-label="Account"
              >
                <User size={18} strokeWidth={1} />
              </Link>
            </div>
            
            {/* Mobile Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 transition-opacity duration-300 hover:opacity-50" 
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1} />
            </button>

            <button 
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 relative p-2 transition-opacity duration-300 hover:opacity-50"
            >
              <ShoppingBag size={18} strokeWidth={1} />
              <span className="text-[10px] items-center justify-center font-light tracking-widest mt-0.5">
                ({cartCount})
              </span>
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Slide-over Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[95vw] sm:w-[600px] bg-white/70 dark:bg-black/70 backdrop-blur-2xl z-[100] shadow-2xl flex flex-col pt-24 px-8 sm:px-16 pb-12 overflow-y-auto"
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-8 left-8 sm:left-16 text-stone-900 dark:text-stone-50 group flex items-center gap-3 transition-opacity duration-300 hover:opacity-50"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-[0.25em] font-light">
                  Close
                </span>
              </button>

              <div className="flex-1 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-24">
                {/* Primary Column */}
                <nav className="flex flex-col gap-6">
                  {mainLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-3xl font-serif font-light text-stone-900 dark:text-stone-50 hover:opacity-50 transition-all duration-300 ease-in-out"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Secondary Mega Column */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex flex-col gap-12"
                >
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400 dark:text-stone-500">Discover</h3>
                    <div className="flex flex-col gap-3">
                      {discoverLinks.map(link => (
                        <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors tracking-widest">{link.name}</Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400 dark:text-stone-500">Shop By Category</h3>
                    <div className="flex flex-col gap-3">
                      {categoryLinks.map(link => (
                        <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-sm font-light text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors tracking-widest">{link.name}</Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-12 flex flex-col gap-8 pt-8 border-t border-stone-200/50">
                <div className="flex justify-between items-center">
                  <div className="flex gap-6">
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Support</Link>
                    <Link href="/shipping" onClick={() => setIsMenuOpen(false)} className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Shipping & Returns</Link>
                  </div>
                  
                  {/* Local Theme Toggle inside Menu */}
                  <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    <span>{theme === "dark" ? "Toggle Light" : "Toggle Dark"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
