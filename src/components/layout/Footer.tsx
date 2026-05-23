"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, Lock, ShieldCheck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Do not render the footer on the homepage "Digital Doorway", inside the CMS Studio, the Checkout page, or individual Product Pages
  if (pathname === "/" || pathname.startsWith("/studio") || pathname.startsWith("/admin") || pathname === "/checkout" || pathname.startsWith("/shop/")) {
    return null;
  }

  return (
    <footer className="relative bg-[#f8f8f8] dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 mt-auto transition-colors duration-1000">
      {/* High-end Value Props Bar */}
      <div className="bg-stone-950 dark:bg-black py-4 px-6 border-b border-stone-800 transition-colors duration-1000">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-16 text-center">
          <div className="flex items-center gap-3 text-white">
            <Globe size={16} strokeWidth={1.5} className="text-stone-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Free Delivery Worldwide</span>
          </div>
          <div className="hidden sm:block w-[1px] h-4 bg-stone-700" />
          <div className="flex items-center gap-3 text-white">
            <Lock size={16} strokeWidth={1.5} className="text-stone-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium">100% Secure Payments</span>
          </div>
          <div className="hidden sm:block w-[1px] h-4 bg-stone-700" />
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck size={16} strokeWidth={1.5} className="text-stone-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Authenticity Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <Link href="/" className="relative h-14 w-48">
            <Image
              src="/logo.png"
              alt="Fleñjure Logo"
              fill
              className="object-contain object-left"
              sizes="128px"
            />
          </Link>
          <p className="text-sm font-light text-stone-500 max-w-xs mt-2">
            Quality. Experience. Fun. <br />
            Enjoy life! On ne vit qu'une fois.
          </p>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500 mb-2">Shop</h4>
          <Link href="/shop" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">All Products</Link>
          <Link href="/custom-packaging" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Custom Packaging</Link>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500 mb-2">Company</h4>
          <Link href="/" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Home</Link>
          <Link href="/contact" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Contact</Link>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500 mb-2">Support</h4>
          <Link href="/shipping" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Shipping & Returns</Link>
          <Link href="/faq" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">FAQ</Link>
          <Link href="/privacy" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
        </div>

        {/* Socials */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-500 mb-2">Social</h4>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Instagram</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">Twitter</a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">TikTok</a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 border-t border-stone-200 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-1000">
        <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600">
          © {new Date().getFullYear()} FLEÑJURE. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600">
          <span>Est. 2020</span>
          <span>Atlanta, GA</span>
        </div>
      </div>
    </footer>
  );
}
