"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import clsx from "clsx";
import { Plus, X, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import shopifyData from "@/data/products.json";

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax effect: moves image slightly down while scrolling
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  // Subtle scaling effect while scrolling
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  // Fade out overlay as we scroll
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0.6]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative w-full h-[90vh] md:h-[100vh] flex flex-col justify-end pb-16 px-8 lg:px-16 bg-stone-900 border-b border-stone-200 overflow-hidden">
        {/* Cinematic parallax background image */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: [0.19, 1, 0.22, 1] }}
          style={{ y, scale }}
        >
          <Image
            src="/Flenjure-herobg.png"
            alt="Fleñjure Campaign Background"
            fill
            priority
            className="object-cover object-center"
          />
          <motion.div style={{ opacity }} className="absolute inset-0 bg-stone-900" />
        </motion.div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.25, 1, 0.5, 1] }}
          >
            <Link
              href="/shop"
              className="group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden border border-white/20 px-10 py-5 text-stone-50 transition-all duration-700"
            >
              <div className="absolute inset-0 translate-y-[101%] bg-white transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
              <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] transition-colors duration-700 group-hover:text-stone-900">
                Discover the Collection
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Story / Editorial */}
      <EditorialSection />      {/* Product Highlight / Essentials - Modern Parallax Layout */}
      <section className="w-full py-40 px-6 lg:px-12 bg-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-32">
          <div className="flex flex-col items-center text-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">Shop</span>
            <h3 className="font-serif text-5xl md:text-8xl font-light tracking-tight">FLEÑJURE <span className="italic">ESSENTIALS</span></h3>
          </div>

          {/* Asymmetric Parallax Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-20 md:gap-32 items-center">
            {/* 1. Rolling Papers (Left - Medium) */}
            <div className="md:col-span-1" />
            <div className="md:col-span-4 group">
              <ParallaxProductCard
                product={mapProduct(shopifyData.products.find(p => p.handle === "flenjure-cali-rolling-papers") || shopifyData.products[0])}
                addItem={addItem}
                speed={-40}
                aspect="aspect-[3/4]"
              />
            </div>

            {/* 2. Bag Packs (Center/Right - Large) */}
            <div className="md:col-span-6 md:translate-y-24 group">
              <ParallaxProductCard
                product={mapProduct(shopifyData.products.find(p => p.handle === "flenjure-snack-packs") || shopifyData.products[1])}
                addItem={addItem}
                speed={60}
                aspect="aspect-[4/5]"
              />
            </div>
            <div className="md:col-span-1" />

            {/* Gap */}
            <div className="col-span-full h-24 md:h-48" />

            {/* 3. OG Jersey (Full width / Asymmetric Right) */}
            <div className="md:col-span-3" />
            <div className="md:col-span-7 group">
              <ParallaxProductCard
                product={mapProduct(shopifyData.products.find(p => p.handle === "flenjure-og-jersey") || shopifyData.products[2])}
                addItem={addItem}
                speed={-20}
                aspect="aspect-[16/10]"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-center md:pt-40">
              <Link
                href="/shop"
                className="group/btn flex flex-col items-center gap-4 text-stone-900"
              >
                <div className="w-20 h-20 rounded-full border border-stone-200 flex items-center justify-center group-hover/btn:bg-stone-900 group-hover/btn:text-white transition-all duration-700">
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-center">View All</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 px-6 lg:px-12 bg-stone-950 text-stone-300">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="relative h-8 w-32 mb-6 block invert brightness-0">
                <Image
                  src="/logo.png"
                  alt="Fleñjure Logo"
                  fill
                  className="object-contain object-left"
                />
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-stone-500 font-light">
                Quality. Experience. Fun. <br />
                Enjoy life! On ne vit qu&apos;une fois. <br />
                We are nothing without YOU.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-stone-50 uppercase tracking-[0.3em] text-[10px] font-bold mb-2">Shop</h4>
              <Link href="/shop" className="text-xs font-light hover:text-stone-50 transition-colors tracking-widest">All Products</Link>
              <Link href="/custom-packaging" className="text-xs font-light hover:text-stone-50 transition-colors tracking-widest">Custom Packaging</Link>
              <Link href="/collections" className="text-xs font-light hover:text-stone-50 transition-colors tracking-widest">Collections</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-stone-50 uppercase tracking-[0.3em] text-[10px] font-bold mb-2">Support</h4>
              <Link href="/contact" className="text-xs font-light hover:text-stone-50 transition-colors tracking-widest">Contact Us</Link>
              <Link href="/shipping" className="text-xs font-light hover:text-stone-50 transition-colors tracking-widest">Shipping & Returns</Link>
              <Link href="/faq" className="text-xs font-light hover:text-stone-50 transition-colors tracking-widest">FAQ</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-stone-800 text-xs text-stone-500">
            <span>&copy; {new Date().getFullYear()} Flenjure. All Rights Reserved.</span>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/terms" className="hover:text-stone-300 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-stone-300 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const mapProduct = (raw: any) => ({
  id: raw.handle,
  name: raw.title,
  price: "$" + (raw.variants?.[0]?.price || "0.00"),
  image: raw.images?.[0]?.src || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop",
  sizes: raw.options?.find((o: any) => o.name === "Size" || o.name === "Title" || o.name === "Quantity")?.values
    .filter((v: any) => v !== "Default Title") || [],
});

function ParallaxProductCard({ product, addItem, speed, aspect }: { product: any; addItem: any; speed: number; aspect: string }) {
  const containerRef = useRef(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-8">
      <div className={clsx(
        "relative overflow-hidden bg-[#f4f4f4] transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group",
        aspect
      )}>
        <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0">
          <motion.div style={{ y }} className="absolute inset-8 md:inset-16 h-full w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain mix-blend-multiply transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </Link>

        {/* Quick Add Icon Trigger */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="absolute top-8 right-8 z-20 w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm border border-stone-100 flex items-center justify-center text-stone-900 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-700 hover:bg-stone-900 hover:text-white shadow-lg"
          aria-label="Quick add"
        >
          <Plus size={24} strokeWidth={1} />
        </button>

        <AnimatePresence>
          {isQuickAddOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md p-8 flex flex-col justify-center items-center gap-8"
            >
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900 transition-colors"
                aria-label="Close"
              >
                <X size={24} strokeWidth={1} />
              </button>

              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Options</span>
                <h4 className="text-xl font-serif font-light mt-2 text-stone-900">{product.name}</h4>
              </div>

              <div className="flex flex-wrap justify-center gap-4 w-full max-w-sm">
                {product.sizes.length > 0 ? (
                  product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => {
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          size: size,
                          image: product.image,
                          quantity: 1,
                        });
                        setIsQuickAddOpen(false);
                      }}
                      className="px-6 py-3 border border-stone-200 text-[10px] tracking-[0.2em] uppercase hover:bg-stone-900 hover:text-white transition-all duration-300 min-w-[80px] font-medium"
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        size: "One Size",
                        image: product.image,
                        quantity: 1,
                      });
                      setIsQuickAddOpen(false);
                    }}
                    className="px-10 py-4 border border-stone-900 text-[10px] tracking-[0.3em] uppercase bg-stone-900 text-white hover:bg-transparent hover:text-stone-900 transition-all duration-300 font-bold"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <Link href={`/shop/${product.id}`}>
            <h4 className="font-serif text-2xl font-light tracking-wide max-w-[70%] hover:text-stone-400 transition-colors">{product.name}</h4>
          </Link>
          <span className="font-semibold text-stone-900 text-sm mt-1">{product.price}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-stone-400">
          <span className="w-8 h-[1px] bg-stone-200" />
          <span>Shop Essential</span>
        </div>
      </div>
    </div>
  );
}

function EditorialSection() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // A more subtle, buttery parallax range
  const y = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  return (
    <section className="w-full py-24 md:py-40 px-6 lg:px-12 overflow-hidden bg-stone-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col gap-8 order-2 md:order-1"
        >
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400">Membership</span>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-8xl leading-[1.1] tracking-tight">
              Enjoy <span className="italic">Life</span>
            </h2>
          </div>
          <p className="max-w-md text-stone-600 leading-relaxed text-lg font-light">
            We offer FREE cash and gifts to our loyal and engaged members. Sign up to join our Private FLEÑJURE Members Club for exclusive drops and access.
          </p>
          <div className="pt-4">
            <Link
              href="/editorial"
              className="group inline-flex items-center gap-4 uppercase tracking-[0.3em] text-[10px] font-bold border-b border-stone-900 pb-2 hover:text-stone-400 hover:border-stone-400 transition-all duration-500"
            >
              Join the Club
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
            </Link>
          </div>
        </motion.div>

        <div
          ref={containerRef}
          className="relative aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden bg-[#f4f4f4] order-1 md:order-2 shadow-2xl"
        >
          <motion.div
            style={{ y, willChange: "transform" }}
            className="absolute inset-0 block h-[130%] w-full -top-[15%]"
          >
            <Image
              src="/PrivateMembers.png"
              alt="Private FLEÑJURE Members"
              fill
              className="object-contain transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
