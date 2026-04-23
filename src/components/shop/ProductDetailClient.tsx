"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { useCartStore } from "@/lib/store";

import shopifyData from "@/data/products.json";

export default function ProductDetailClient({ productData }: { productData: any }) {

  const [selectedSize, setSelectedSize] = useState<string | null>(
    productData.sizes.length > 0 ? null : "One Size"
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (productData.sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    setAdding(true);
    setTimeout(() => {
      addItem({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        size: selectedSize!,
        image: productData.images[0],
        quantity: quantity,
      });
      setAdding(false);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 lg:pt-32 pb-24 px-6 lg:px-12 bg-stone-50">
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left: Sticky Details (on desktop) */}
        <div className="order-2 lg:order-1 flex flex-col gap-8 lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)]">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 mb-4">
            <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop" className="hover:text-stone-900 transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-stone-900">Apparel</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4"
          >
            <h1 className="text-3xl md:text-5xl font-serif font-light mb-2">{productData.name}</h1>
            <p className="text-xl text-stone-500 font-light mb-8">{productData.price}</p>
            
            <div className="prose prose-stone mb-10 font-light text-sm leading-relaxed tracking-wide text-stone-600">
              <p>{productData.description}</p>
            </div>

            {productData.sizes.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs uppercase tracking-[0.15em] font-normal">Size</h3>
                  <button className="text-xs text-stone-500 hover:text-stone-900 underline transition-colors duration-500 min-h-[44px]">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                   {productData.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={clsx(
                        "py-3 border text-xs tracking-widest transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[44px]",
                        selectedSize === size 
                          ? "border-stone-900 bg-stone-900 text-stone-50" 
                          : "border-stone-200 text-stone-600 hover:border-stone-900"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-between border border-stone-200 min-h-[50px] w-32 px-4 shadow-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-stone-400 hover:text-stone-900 transition-colors p-2 -ml-2"
                >
                  <Minus size={14} strokeWidth={1} />
                </button>
                <span className="text-sm font-light">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-stone-400 hover:text-stone-900 transition-colors p-2 -mr-2"
                >
                  <Plus size={14} strokeWidth={1} />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-stone-900 text-stone-50 text-xs font-normal uppercase tracking-[0.15em] min-h-[50px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-stone-200">
              {/* Details Accordion */}
              <div className="border-b border-stone-200">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                  className="w-full flex justify-between items-center py-6 text-xs uppercase tracking-[0.15em] font-normal text-stone-900 hover:text-stone-500 transition-colors duration-500"
                >
                  <span>Details & Care</span>
                  {openAccordion === 'details' ? <Minus size={16} strokeWidth={1} /> : <Plus size={16} strokeWidth={1} />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'details' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <ul className="list-disc pl-4 space-y-2 text-sm text-stone-600 font-light pb-6">
                        {productData.details.map((detail: string, i: number) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping Accordion */}
              <div className="border-b border-stone-200">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex justify-between items-center py-6 text-xs uppercase tracking-[0.15em] font-normal text-stone-900 hover:text-stone-500 transition-colors duration-500"
                >
                  <span>Shipping & Returns</span>
                  {openAccordion === 'shipping' ? <Minus size={16} strokeWidth={1} /> : <Plus size={16} strokeWidth={1} />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="text-sm text-stone-600 font-light pb-6 space-y-4 leading-relaxed">
                        <p>Complimentary shipping on all orders over $200. Orders are processed within 1-2 business days.</p>
                        <p>Returns are accepted within 14 days of delivery for store credit or refund. Items must be unworn with original tags attached.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Scrolling Image Gallery */}
        <div className="order-1 lg:order-2 flex flex-col gap-4 lg:gap-8">
          {productData.images.map((img: string, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] w-full bg-[#f4f4f4] group overflow-hidden cursor-zoom-in"
            >
              <div className="absolute inset-8 lg:inset-16">
                <Image
                  src={img}
                  alt={`${productData.name} - Image ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  className="object-contain mix-blend-multiply transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-125"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
