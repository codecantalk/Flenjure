"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCartStore, useCurrencyStore } from "@/lib/store";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import ImmediateApplePay from "./ImmediateApplePay";

export default function ProductDetailClient({ productData }: { productData: any }) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const { currency } = useCurrencyStore();

  const isCafeItem = productData.isCafeItem === true;
  let quickPayLabel = "Apple Pay";
  let quickPayMethod = "applepay";

  if (isCafeItem) {
    if (currency === 'GBP') {
      quickPayLabel = "LLOYDS Transfer";
      quickPayMethod = "lloyds";
    } else if (currency === 'EUR') {
      quickPayLabel = "Revolut";
      quickPayMethod = "revolut";
    } else {
      quickPayLabel = "Bank transfer/ Cash";
      quickPayMethod = "zelle";
    }
  }

  let currentPrice = productData.price;
  if (selectedSize && productData.variants) {
    const matchedVariant = productData.variants.find((v: any) => 
      (v.size + (v.color ? ` - ${v.color}` : '')) === selectedSize
    );
    if (matchedVariant && matchedVariant.price && String(matchedVariant.price).trim() !== "") {
      currentPrice = `$${Number(matchedVariant.price).toFixed(2)}`;
    }
  }

  const handleAddToCart = () => {
    if (productData.sizes && productData.sizes.length > 0 && !selectedSize) {
      setIsDropdownOpen(true);
      return;
    }
    setAdding(true);
    addItem({
      id: productData.id,
      name: productData.name,
      price: currentPrice,
      image: productData.images[0],
      size: selectedSize || "OS",
      quantity: 1,
      isCafe: productData.isCafeItem === true
    });
    setTimeout(() => {
      setAdding(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 lg:pt-32 pb-24 bg-white dark:bg-stone-950 transition-colors duration-1000">
      <div className="max-w-[1800px] mx-auto w-full px-6 lg:px-12">
        
        {/* ========================================= */}
        {/* MOBILE LAYOUT (Stack)                     */}
        {/* ========================================= */}
        <div className="flex flex-col lg:hidden w-full pb-64">
           {/* Images Carousel */}
           <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 w-full no-scrollbar scroll-smooth">
              {productData.images.map((img: string, idx: number) => (
                <div key={idx} className="snap-center shrink-0 w-full aspect-square bg-transparent relative mb-2">
                  <Image src={img} alt={`${productData.name} - ${idx}`} fill priority={idx === 0} className="object-cover" />
                </div>
              ))}
           </div>

           {/* Accordions */}
           <div className="border-t border-stone-200 dark:border-stone-800 mb-12">
              <DetailAccordion title="Product Details" defaultOpen={true}>
                <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-stone-600 dark:text-stone-400 font-light pb-6 leading-relaxed">
                  {productData.details.map((detail: string, i: number) => <li key={i}>{detail}</li>)}
                </ul>
              </DetailAccordion>
              <DetailAccordion title="Sizing">
                <div className="pb-6">
                  {productData.sizing && productData.sizing.type !== 'one-size' ? (
                    <p className="text-[11px] text-stone-500 font-light tracking-wide">Please check desktop site for detailed metric sizing charts.</p>
                  ) : (
                    <p className="text-[11px] text-stone-500 font-light tracking-wide">This item is uniformly produced. One size fits most standard applications.</p>
                  )}
                </div>
              </DetailAccordion>
              <DetailAccordion title="Delivery and Returns">
                <div className="text-[11px] text-stone-600 dark:text-stone-400 font-light pb-6 leading-relaxed space-y-3">
                  <p>Orders are processed at our distribution center within five business days. Shipping timelines and charges vary based on the method selected at checkout and destination.</p>
                  <p>Returns are accepted within 14 days of delivery for store credit or refund.</p>
                </div>
              </DetailAccordion>
              <DetailAccordion title="Manual Payments">
                <div className="text-[11px] text-stone-600 dark:text-stone-400 font-light pb-6 leading-relaxed space-y-3">
                  <p>We accept cash equivalents including CashApp, Zelle, and select cryptocurrencies. Select 'Manual Transfer' at checkout to receive our payment QR codes and direct transfer instructions.</p>
                </div>
              </DetailAccordion>
           </div>

           {/* Curated Pairings Mobile */}
           {productData.relatedProducts && productData.relatedProducts.length > 0 && (
              <div>
                 <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-6 tracking-[0.3em]">Curated Pairings</h4>
                 <div className="flex overflow-x-auto snap-x gap-4 pb-6 w-full no-scrollbar">
                    {productData.relatedProducts.map((relatedProduct: any) => (
                      <Link href={`/${productData.isCafeItem ? 'cafe' : 'shop'}/${relatedProduct.id}`} key={relatedProduct.id} className="snap-start shrink-0 w-[60%] flex flex-col gap-2">
                        <div className="aspect-square bg-transparent relative">
                           <Image src={relatedProduct.image} alt={relatedProduct.name} fill className="object-cover opacity-90" />
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-stone-900 dark:text-white truncate mt-1">{relatedProduct.name}</span>
                        <span className="text-[9px] text-stone-400 font-medium tracking-widest">{relatedProduct.price}</span>
                      </Link>
                    ))}
                 </div>
              </div>
           )}

           {/* STICKY BOTTOM BAR (Mobile Only) */}
           <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 p-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] lg:hidden">
              <div className="max-w-[1800px] mx-auto w-full px-2 sm:px-4">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-[12px] text-[#323232] dark:text-white truncate pr-4">{productData.name}</span>
                    <span className="text-[12px] text-[#323232] dark:text-white whitespace-nowrap">{formatPrice(currentPrice)}</span>
                 </div>
                 
                 <div className="w-full mb-3">
                    {/* Size Selector */}
                    <div className="relative">
                       <button 
                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                         className="w-full h-full border border-[#d9d9d9] dark:border-stone-800 p-[12px] flex justify-between items-center bg-white dark:bg-stone-950 transition-colors"
                       >
                         <span className="text-[11px] text-[#323232] dark:text-white font-medium">
                           {productData.sizes && productData.sizes.length > 0 ? (selectedSize || "Select Size") : "Unified Size"}
                         </span>
                         <ChevronDown size={14} className={clsx("text-[#737373] transition-transform duration-300", isDropdownOpen && "rotate-180")} />
                       </button>
                       
                       <AnimatePresence>
                         {isDropdownOpen && productData.sizes && productData.sizes.length > 0 && (
                           <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute bottom-full mb-2 w-full bg-white dark:bg-stone-950 border border-[#d9d9d9] dark:border-stone-800 shadow-xl z-50">
                              {productData.sizes.map((size: string) => (
                                <button 
                                  key={size} 
                                  onClick={() => { setSelectedSize(size); setIsDropdownOpen(false); }} 
                                  className={clsx("w-full px-4 py-3 text-left text-[11px] font-medium transition-colors", selectedSize === size ? "bg-stone-100 dark:bg-stone-900 text-[#323232] dark:text-white" : "hover:bg-stone-50 dark:hover:bg-stone-900 text-[#737373] dark:text-stone-400")}
                                >
                                  {size}
                                </button>
                              ))}
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                 </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddToCart} 
                      disabled={adding} 
                      className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white py-[14px] text-[11px] font-medium tracking-[0.05em] uppercase hover:bg-stone-50 dark:hover:bg-stone-800 transition-all disabled:opacity-50"
                    >
                      {adding ? "Adding..." : "Add to Bag"}
                    </button>
                    {quickPayMethod === 'applepay' ? (
                        <ImmediateApplePay 
                          productId={productData.id} 
                          price={currentPrice} 
                          selectedSize={selectedSize} 
                          requireSize={productData.sizes && productData.sizes.length > 0} 
                        />
                    ) : (
                      <button 
                        onClick={() => { handleAddToCart(); setTimeout(() => router.push(`/checkout?method=${quickPayMethod}`), 300); }} 
                        disabled={adding} 
                        className="flex-1 bg-[#121212] dark:bg-white text-white dark:text-[#121212] py-[14px] text-[11px] font-medium tracking-[0.05em] uppercase hover:opacity-80 transition-all disabled:opacity-50 h-[43px]"
                      >
                        {quickPayLabel}
                      </button>
                    )}
                  </div>
              </div>
           </div>
        </div>


        {/* ========================================= */}
        {/* DESKTOP LAYOUT (3-Column ALD)               */}
        {/* ========================================= */}
        <div className="hidden lg:grid grid-cols-12 gap-16 items-start">
          
          {/* COLUMN 1: Info & Editorial (Left) */}
          <div className="col-span-3 flex flex-col order-1">
             <div className="flex flex-col gap-2 mb-12">
              <h1 className="text-xl font-medium text-stone-900 dark:text-white uppercase tracking-tight">{productData.name}</h1>
              <p className="text-base text-stone-900 dark:text-stone-300 font-light">{formatPrice(currentPrice)}</p>
            </div>

            {/* Accordions */}
            <div className="border-t border-stone-200 dark:border-stone-800">
              <DetailAccordion title="Product Details" defaultOpen={true}>
                <ul className="list-disc pl-4 space-y-1.5 text-[11px] lg:text-[12px] text-stone-600 dark:text-stone-400 font-light pb-6 leading-relaxed">
                  {productData.details.map((detail: string, i: number) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </DetailAccordion>

              <DetailAccordion title="Sizing">
                <div className="pb-6">
                  {productData.sizing && productData.sizing.type !== 'one-size' ? (
                    <>
                      <p className="text-[11px] text-stone-500 mb-4 font-light uppercase tracking-widest">Global Sizing Standard</p>
                      <table className="w-full text-[10px] text-left text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                        <thead>
                          <tr className="border-b border-stone-100 dark:border-stone-800">
                            <th className="pb-2 font-medium">SIZE</th>
                            <th className="pb-2 font-medium">WIDTH</th>
                            <th className="pb-2 font-medium">LENGTH</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productData.sizing.metrics.map((m: any, idx: number) => (
                            <tr key={idx} className="border-b border-stone-50 dark:border-stone-900/50 last:border-0">
                              <td className="py-2.5 text-[11px] font-medium text-stone-900 dark:text-stone-300">{m.size}</td>
                              <td className="py-2.5">{m.width}</td>
                              <td className="py-2.5">{m.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <p className="text-[11px] text-stone-500 font-light tracking-wide">
                      This item is uniformly produced. One size fits most standard applications.
                    </p>
                  )}
                </div>
              </DetailAccordion>

              <DetailAccordion title="Delivery and Returns">
                <div className="text-[11px] text-stone-600 dark:text-stone-400 font-light pb-6 leading-relaxed space-y-3">
                  <p>Orders are processed at our distribution center within five business days. Shipping timelines and charges vary based on the method selected at checkout and destination.</p>
                  <p>Returns are accepted within 14 days of delivery for store credit or refund.</p>
                </div>
              </DetailAccordion>

              <DetailAccordion title="Manual Payments">
                <div className="text-[11px] text-stone-600 dark:text-stone-400 font-light pb-6 leading-relaxed space-y-3">
                  <p>We accept cash equivalents including CashApp, Zelle, and select cryptocurrencies. Select 'Manual Transfer' at checkout to receive our payment QR codes and direct transfer instructions.</p>
                </div>
              </DetailAccordion>
            </div>

            {/* Curated Pairings - Contextual Relevancy */}
            {productData.relatedProducts && productData.relatedProducts.length > 0 && (
              <div className="mt-12">
                 <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-6 tracking-[0.3em]">Curated Pairings</h4>
                 <div className="grid grid-cols-2 gap-3">
                    {productData.relatedProducts.map((relatedProduct: any) => (
                      <Link href={`/${productData.isCafeItem ? 'cafe' : 'shop'}/${relatedProduct.id}`} key={relatedProduct.id} className="flex flex-col gap-2 group cursor-pointer">
                        <div className="aspect-square bg-transparent relative overflow-hidden transition-all duration-700">
                           <Image src={relatedProduct.image} alt={relatedProduct.name} fill className="object-cover opacity-80 group-hover:opacity-100" />
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-stone-900 dark:text-white truncate mt-1 underline decoration-transparent group-hover:decoration-stone-200 transition-all">
                           {relatedProduct.name}
                        </span>
                        <span className="text-[9px] text-stone-400 font-medium tracking-widest">{relatedProduct.price}</span>
                      </Link>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: Large Visual Focus (Center) */}
          <div className="col-span-6 order-2">
            <div className="flex flex-col gap-4">
              {productData.images.map((img: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.2 }}
                  className="relative aspect-square w-full bg-transparent group overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${productData.name} - ${idx}`}
                    fill
                    priority={idx === 0}
                    className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: Selection & CTA (Right) */}
          <div className="col-span-3 sticky top-32 flex flex-col gap-8 order-3">
             {/* Size Selection */}
             <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-stone-300">
                  {productData.sizes && productData.sizes.length > 0 ? "Select Size" : "Availability"}
                </span>
                
                {productData.sizes && productData.sizes.length > 0 ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={clsx(
                        "w-full flex justify-between items-center border p-4 text-[11px] uppercase tracking-[0.2em] transition-all duration-500",
                        isDropdownOpen 
                          ? "border-stone-900 dark:border-white text-stone-900 dark:text-white" 
                          : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-900 dark:hover:border-white"
                      )}
                    >
                      <span className="font-medium">{selectedSize || "Choose a Size"}</span>
                      <ChevronDown size={14} className={clsx("transition-transform duration-500", isDropdownOpen && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 z-50 shadow-2xl py-2"
                        >
                           {productData.sizes.map((size: string) => (
                             <button
                               key={size}
                               onClick={() => {
                                 setSelectedSize(size);
                                 setIsDropdownOpen(false);
                               }}
                               className={clsx(
                                 "w-full px-6 py-4 text-left text-[11px] uppercase tracking-[0.2em] transition-colors",
                                 selectedSize === size 
                                  ? "bg-stone-900 text-white dark:bg-white dark:text-black" 
                                  : "hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-500 dark:text-stone-400"
                               )}
                             >
                               {size}
                             </button>
                           ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="w-full border border-stone-100 dark:border-stone-900 p-4 text-[11px] uppercase tracking-[0.2em] text-stone-900/40 dark:text-white/30 italic">
                     Unified Size
                  </div>
                )}
             </div>

              <div className="flex gap-3 w-full">
                 <button 
                    onClick={handleAddToCart} 
                    disabled={adding} 
                    className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white py-4 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-stone-50 dark:hover:bg-stone-800 transition-all disabled:opacity-50 shadow-sm"
                 >
                    {adding ? "Adding..." : "Add to Bag"}
                 </button>
                 <button 
                    onClick={() => { handleAddToCart(); setTimeout(() => router.push(`/checkout?method=${quickPayMethod}`), 300); }} 
                    disabled={adding} 
                    className="flex-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-4 text-[12px] font-medium tracking-[0.1em] uppercase hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                 >
                    {quickPayLabel}
                 </button>
              </div>
          </div>
        </div>

        {/* Recently Viewed Footer Section */}
        {productData.relatedProducts && productData.relatedProducts.length > 0 && (
          <div className="mt-32 border-t border-stone-200 dark:border-stone-800 pt-12">
             <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-900 dark:text-white mb-12">Recently Viewed</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {productData.relatedProducts.map((relatedProduct: any) => (
                  <Link href={`/${productData.isCafeItem ? 'cafe' : 'shop'}/${relatedProduct.id}`} key={relatedProduct.id} className="flex flex-col gap-3 group">
                     <div className="aspect-square bg-transparent relative shadow-sm">
                        <Image src={relatedProduct.image} alt={relatedProduct.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                     </div>
                     <div className="flex justify-between text-[9px] uppercase tracking-widest mt-1 font-bold">
                        <span className="text-stone-900 dark:text-white">{relatedProduct.name}</span>
                        <span className="text-stone-400">{relatedProduct.price}</span>
                     </div>
                  </Link>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailAccordion({ title, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-200 dark:border-stone-800">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-[11px] uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-stone-100 hover:text-stone-500 transition-colors"
      >
        <span>{title}</span>
        {open ? <Minus size={12} strokeWidth={1.5} /> : <Plus size={12} strokeWidth={1.5} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
