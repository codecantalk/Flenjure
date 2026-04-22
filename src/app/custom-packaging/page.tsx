"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const packagingOptions = [
  {
    title: "Bag Packs",
    description: "Premium smell-proof bags for your most treasured consumables. Available in multiple sizes with custom branding options.",
    image: "/PrivateMembers.png", // Placeholder image, using something brand-related
  },
  {
    title: "Rolling Papers",
    description: "Highest quality vegan fibers and non-toxic Arabic gum. Design your own booklets with custom covers and watermarks.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop",
  },
  {
    title: "Custom Accessories",
    description: "From lighters to trays, we offer a full suite of customizable lifestyle accessories to elevate your brand.",
    image: "https://images.unsplash.com/photo-1520004434532-668416a08753?q=80&w=2000&auto=format&fit=crop",
  },
];

export default function CustomPackaging() {
  return (
    <div className="flex flex-col min-h-screen bg-white pt-24">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 px-6 lg:px-12 border-b border-stone-100">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">Services</span>
            <h1 className="font-serif text-5xl md:text-8xl mt-4 font-light tracking-tight leading-[1.1]">
              Custom <span className="italic text-stone-400">Packaging</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl text-stone-600 text-lg md:text-xl font-light leading-relaxed"
          >
            Your packaging is the first contact consumers have with your brand. We provide distinctive branding and packaging solutions to provide your customers with a captivating experience with high quality packaging made to engage customers. We know what it takes to stand out from the competition and provide your business with the marketing and packaging solutions to elevate your brand.
          </motion.p>
        </div>
      </section>

      {/* Packaging Grid */}
      <section className="w-full py-24 md:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
            {packagingOptions.map((option, i) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="flex flex-col gap-8 group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-50">
                  <Image
                    src={option.image}
                    alt={option.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif text-3xl font-light">{option.title}</h3>
                  <p className="text-stone-500 font-light leading-relaxed max-w-sm">
                    {option.description}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {/* Contact CTA Block */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-12 p-12 lg:p-24 bg-stone-900 text-white"
            >
              <div className="flex flex-col gap-6">
                <h3 className="font-serif text-4xl md:text-5xl font-light leading-tight">
                  Ready to <br /><span className="italic opacity-50">Collaborate?</span>
                </h3>
                <p className="text-stone-400 font-light leading-relaxed max-w-xs">
                  For bulk orders and custom branding inquiries, our team is ready to assist you in creating unique experiences.
                </p>
              </div>
              <Link
                href="/contact"
                className="group flex items-center gap-4 uppercase tracking-[0.4em] text-[10px] font-bold border-b border-white/30 pb-4 hover:border-white transition-all duration-500 w-fit"
              >
                Get in Touch
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
