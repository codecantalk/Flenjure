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

const navLinks = [
  { name: "New Arrivals", href: "/shop" },
  { name: "Custom Packaging", href: "/custom-packaging" },
  { name: "Collections", href: "/collections" },
  { name: "Editorial", href: "/editorial" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items, setIsOpen: setCartOpen } = useCartStore();
  
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
          isScrolled
            ? "bg-white/80 backdrop-blur-lg py-4 border-b border-stone-100"
            : (isHome ? "bg-transparent py-8" : "bg-white py-6 border-b border-stone-50")
        )}
      >
        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-3 items-center">
          {/* Left: Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className={clsx(
                "group flex items-center gap-3 transition-all duration-300 hover:opacity-50",
                isHome && !isScrolled ? "text-white" : "text-stone-900"
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
            isHome && !isScrolled ? "text-white" : "text-stone-900"
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
              className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[95vw] sm:w-[450px] bg-white z-[100] shadow-2xl flex flex-col pt-24 px-8 sm:px-12 pb-12 overflow-y-auto"
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-8 left-8 sm:left-12 text-stone-900 group flex items-center gap-3 transition-opacity duration-300 hover:opacity-50"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-[0.25em] font-light">
                  Close
                </span>
              </button>

              <nav className="flex flex-col mt-12 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                    className="border-b border-stone-100 last:border-none"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-6 text-3xl sm:text-4xl font-serif font-light text-stone-900 hover:pl-2 transition-all duration-500 ease-in-out"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-12 flex flex-col gap-8 pt-12 border-t border-stone-200">
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400">Account</span>
                    <Link href="/account" onClick={() => setIsMenuOpen(false)} className="text-xs font-light text-stone-600 hover:text-stone-900 transition-colors tracking-widest">Login / Register</Link>
                    <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="text-xs font-light text-stone-600 hover:text-stone-900 transition-colors tracking-widest">Order History</Link>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400">Support</span>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-xs font-light text-stone-600 hover:text-stone-900 transition-colors tracking-widest">Contact Us</Link>
                    <Link href="/shipping" onClick={() => setIsMenuOpen(false)} className="text-xs font-light text-stone-600 hover:text-stone-900 transition-colors tracking-widest">Shipping & Returns</Link>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link href="https://instagram.com" className="text-stone-400 hover:text-stone-900 transition-colors"><span className="text-[10px] uppercase tracking-widest">Instagram</span></Link>
                  <Link href="https://twitter.com" className="text-stone-400 hover:text-stone-900 transition-colors"><span className="text-[10px] uppercase tracking-widest">Twitter</span></Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
