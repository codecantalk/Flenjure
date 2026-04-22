"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, Lock, ShieldCheck, Truck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Do not render the footer on the homepage "Digital Doorway"
  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="bg-[#f2f2f2] border-t border-stone-200 mt-auto">
      {/* High-end Value Props Bar */}
      <div className="bg-stone-900 py-4 px-6">
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
          <Link href="/" className="relative h-10 w-32 invert">
            <Image
              src="/logo.png"
              alt="Fleñjure Logo"
              fill
              className="object-contain object-left"
            />
          </Link>
          <p className="text-sm font-light text-stone-500 max-w-xs mt-2">
            Quality. Experience. Fun. <br />
            Enjoy life! On ne vit qu'une fois.
          </p>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-2">Shop</h4>
          <Link href="/shop" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">All Products</Link>
          <Link href="/custom-packaging" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">Custom Packaging</Link>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-2">Company</h4>
          <Link href="/" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">Home</Link>
          <Link href="/contact" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">Contact</Link>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-2">Support</h4>
          <Link href="/shipping" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">Shipping & Returns</Link>
          <Link href="/faq" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">FAQ</Link>
          <Link href="/privacy" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">Privacy Policy</Link>
        </div>

        {/* Newsletter / Socials */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-2">Social</h4>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">Instagram</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">Twitter</a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-600 hover:text-stone-900 transition-colors">TikTok</a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] uppercase tracking-widest text-stone-400">
          © {new Date().getFullYear()} FLEÑJURE. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400">
          <span>Est. 2024</span>
          <span>Smyrna, GA</span>
        </div>
      </div>
    </footer>
  );
}
