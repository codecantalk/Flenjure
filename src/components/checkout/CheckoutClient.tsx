"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info, ShoppingBag, Lock, Loader2 } from "lucide-react";
import clsx from "clsx";
import { createOrder, createOrUpdateCartSession } from "@/app/admin/actions";

export default function CheckoutClient() {
   const { items, clearCart } = useCartStore();
   const router = useRouter();
   const cartTotal = items.reduce((total, item) => {
      const priceNum = parseFloat(item.price.replace("$", ""));
      return total + priceNum * item.quantity;
   }, 0);

   const [email, setEmail] = useState("");
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [address, setAddress] = useState("");
   const [city, setCity] = useState("");
   const [state, setState] = useState("");
   const [zip, setZip] = useState("");
   const [phone, setPhone] = useState("");
   const [isProcessing, setIsProcessing] = useState(false);
   
   const [showBilling, setShowBilling] = useState(false);
   const [paymentMethod, setPaymentMethod] = useState("credit");
   const [showOrderSummary, setShowOrderSummary] = useState(false);

   // CRM Abandoned Cart tracking
   useEffect(() => {
     if (!email || !email.includes("@")) return;
     const timeout = setTimeout(() => {
       createOrUpdateCartSession({
         email,
         whatsapp_number: phone,
         items: items.map(i => ({ id: i.id, title: i.name, quantity: i.quantity, price: parseFloat(i.price.replace("$", "")) })),
         is_recovered: false
       }).catch(console.error);
     }, 2000);
     return () => clearTimeout(timeout);
   }, [email, phone, items]);

   const handlePayment = async (e: React.FormEvent) => {
     e.preventDefault();
     if (items.length === 0) return alert("Your cart is empty");
     if (!email || !firstName || !lastName || !address || !city || !state || !zip) {
       return alert("Please fill in all required shipping fields");
     }

     setIsProcessing(true);
     try {
       const orderData = {
         status: "paid", // or pending depending on payment flow
         total_amount: cartTotal,
         payment_method: paymentMethod,
         payment_status: "completed",
         shipping_address: {
           fullName: `${firstName} ${lastName}`,
           addressLine1: address,
           city, state, postalCode: zip, country: "US"
         },
         items: items.map(i => ({ product_id: i.id, title: i.name, quantity: i.quantity, price: parseFloat(i.price.replace("$", "")), image: i.image })),
         email,
         whatsapp_number: phone
       };
       
       const newOrder = await createOrder(orderData);
       
       // Mark CRM session as recovered
       await createOrUpdateCartSession({
         email,
         items: [],
         is_recovered: true
       });

       clearCart();
       router.push(`/checkout/success?orderId=${newOrder.id}`);
     } catch (err) {
       console.error("Payment failed", err);
       alert("An error occurred processing your order.");
       setIsProcessing(false);
     }
   };

   return (
      <div className="flex flex-col lg:flex-row min-h-screen font-sans bg-white selection:bg-[#18261e] selection:text-white">
         {/* Mobile Order Summary Toggle */}
         <div className="lg:hidden w-full bg-[#fcfcfc] border-b border-[#e6e6e6] py-4 px-6 sticky top-0 z-40">
            <button 
               onClick={() => setShowOrderSummary(!showOrderSummary)}
               className="w-full flex justify-between items-center text-[14px] text-[#323232]"
            >
               <div className="flex items-center gap-2 text-[#2a3d31]">
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  <span>{showOrderSummary ? 'Hide order summary' : 'Show order summary'}</span>
                  <ChevronDown size={14} className={clsx("transition-transform duration-300", showOrderSummary && "rotate-180")} />
               </div>
               <span className="font-semibold text-lg text-stone-900">${cartTotal.toFixed(2)}</span>
            </button>
            
            <AnimatePresence>
               {showOrderSummary && (
                  <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                  >
                     <div className="pt-6 pb-2 flex flex-col gap-6">
                        {items.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-4">
                              <div className="relative w-16 h-16 bg-white border border-[#e6e6e6] rounded-[6px] overflow-hidden flex-shrink-0">
                                 <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                                 <div className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-[rgba(114,114,114,0.9)] rounded-full flex items-center justify-center text-[11px] text-white font-medium z-10">{item.quantity}</div>
                              </div>
                              <div className="flex-1">
                                 <p className="text-[14px] font-medium text-stone-900">{item.name}</p>
                                 <p className="text-[12px] text-[#737373]">{item.size}</p>
                              </div>
                              <span className="text-[14px] font-medium text-stone-900">${(parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}</span>
                           </div>
                        ))}
                        <div className="border-t border-[#e6e6e6] pt-4 mt-2">
                           <div className="flex justify-between text-[14px] mb-2">
                              <span className="text-[#737373]">Subtotal</span>
                              <span className="font-medium text-stone-900">${cartTotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-[14px]">
                              <span className="text-[#737373]">Shipping</span>
                              <span className="text-[#737373]">Calculated at next step</span>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* LEFT: Checkout Information (White Background) */}
         <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-end pt-8 lg:pt-24 pb-24 px-6 lg:pl-12 lg:pr-[5%] bg-white border-r border-[#e6e6e6]">
            <div className="w-full max-w-[560px] flex flex-col">

               {/* Express Checkout */}
               <div className="mb-10 mt-8">
                  <p className="text-center text-[12px] text-[#737373] mb-3">Express checkout</p>
                  <div className="flex flex-col gap-3 w-full">
                     <button type="button" className="w-full h-12 bg-[#ffc439] rounded-[4px] flex items-center justify-center hover:opacity-90 transition-opacity">
                        <Image src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_150x38.png" alt="PayPal" width={85} height={20} className="object-contain" />
                     </button>
                     <button type="button" className="w-full h-12 bg-black rounded-[4px] flex items-center justify-center hover:opacity-90 transition-opacity">
                        <div className="flex items-center gap-2 text-white">
                           <span className="text-lg font-medium tracking-tight">G Pay</span>
                        </div>
                     </button>
                  </div>
                  <div className="relative mt-8 mb-4 text-center">
                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e6e6e6]"></div></div>
                     <span className="relative px-4 bg-white text-[12px] text-[#737373]">OR</span>
                  </div>
               </div>

                <form className="flex flex-col gap-9" onSubmit={handlePayment}>
                  {/* Contact */}
                  <div className="flex flex-col gap-3">
                     <div className="flex justify-between items-end mb-1">
                        <h2 className="text-xl font-medium text-stone-900 dark:text-white tracking-tight">Contact</h2>
                        <Link href="/account" className="text-[13px] text-[#323232] dark:text-stone-300 underline hover:no-underline font-normal">Sign in</Link>
                     </div>
                     <input
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] focus:ring-1 focus:ring-[#000] focus:border-[#000] dark:focus:border-white dark:focus:ring-white outline-none text-[14px] font-normal transition-all placeholder:text-[#ababab] dark:text-white dark:bg-stone-950 shadow-sm"
                     />
                     <div className="flex items-center gap-2 mt-1">
                        <input type="checkbox" id="news" className="w-[18px] h-[18px] rounded-[4px] border-[#d9d9d9] dark:border-stone-800 checked:bg-[#000] dark:checked:bg-white checked:border-[#000] cursor-pointer" defaultChecked />
                        <label htmlFor="news" className="text-[14px] text-[#323232] dark:text-stone-300 cursor-pointer">Email me with news and offers</label>
                     </div>
                     <p className="text-[13px] text-[#737373] mt-1">
                        By providing your email address, you agree to our <Link href="/privacy" className="underline hover:no-underline text-[#323232] dark:text-stone-300">Privacy Policy</Link>.
                     </p>
                  </div>

                  {/* Delivery */}
                  <div className="flex flex-col gap-3">
                     <h2 className="text-xl font-medium text-[#323232] dark:text-white tracking-tight mb-1">Delivery</h2>
                     <div className="relative">
                        <select className="w-full p-[14px] pt-5 border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-stone-950 dark:text-white shadow-sm focus:ring-1 focus:ring-[#000] focus:border-[#000]">
                           <option>United States</option>
                           <option>United Kingdom</option>
                           <option>Canada</option>
                           <option>Australia</option>
                        </select>
                        <div className="absolute top-1.5 left-[15px] text-[11px] text-[#737373]">Country/Region</div>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <input type="text" required placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                        <input type="text" required placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                     </div>
                     <input type="text" placeholder="Company (optional)" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                     <div className="relative">
                        <input type="text" required placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ababab] pointer-events-none">
                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                     </div>
                     <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                     <div className="grid grid-cols-3 gap-3">
                        <input type="text" required placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                        <div className="relative">
                           <select required value={state} onChange={e => setState(e.target.value)} className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-stone-950 dark:text-white shadow-sm focus:ring-1 focus:ring-[#000] focus:border-[#000]">
                              <option value="">State</option>
                              <option value="NY">NY</option>
                              <option value="CA">CA</option>
                              <option value="TX">TX</option>
                              <option value="FL">FL</option>
                              <option value="GA">GA</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373]" />
                        </div>
                        <input type="text" required placeholder="ZIP code" value={zip} onChange={e => setZip(e.target.value)} className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                     </div>
                     <div className="relative mt-1">
                        <input type="tel" placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] dark:text-white dark:bg-stone-950" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#000] dark:hover:text-white cursor-help"><Info size={16} /></div>
                     </div>
                     <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="saveInfo" className="w-[18px] h-[18px] rounded-[4px] border-[#d9d9d9] dark:border-stone-800 checked:bg-[#000] checked:border-[#000] cursor-pointer" />
                        <label htmlFor="saveInfo" className="text-[14px] text-[#323232] dark:text-stone-300 cursor-pointer">Save this information for next time</label>
                     </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="flex flex-col gap-3">
                     <h2 className="text-xl font-medium text-[#323232] dark:text-white tracking-tight mb-1">Shipping method</h2>
                     <div className="p-4 bg-[#f5f5f5] dark:bg-stone-900 rounded-[4px] text-[14px] text-[#737373] dark:text-stone-400 text-center border dark:border-stone-800">
                        Enter your shipping address to view available shipping methods.
                     </div>
                  </div>

                  {/* Payment */}
                  <div className="flex flex-col gap-3">
                     <h2 className="text-xl font-medium text-[#323232] dark:text-white tracking-tight mb-1">Payment</h2>
                     <p className="text-[13px] text-[#737373] mb-1">All transactions are secure and encrypted.</p>

                     <div className="flex flex-col border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] bg-white dark:bg-stone-950 shadow-sm relative z-0">

                        {/* Credit Card Wrapper */}
                        <div
                           className={`flex flex-col transition-all relative z-10 ${paymentMethod === 'credit'
                                 ? 'bg-[#fafafa] dark:bg-stone-900'
                                 : 'border-b border-[#d9d9d9] dark:border-stone-800 bg-white dark:bg-stone-950 rounded-t-[3px] hover:bg-[#fafafa]'
                              }`}
                        >
                           <div
                              className={`p-[18px] flex items-center justify-between cursor-pointer rounded-[4px] transition-all ${paymentMethod === 'credit'
                                    ? 'border-[1.5px] border-black dark:border-white'
                                    : ''
                                 }`}
                              onClick={() => setPaymentMethod("credit")}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'credit' ? 'border-[#000] dark:border-white bg-[#000] dark:bg-white' : 'border-[#d9d9d9] dark:border-stone-700'}`}>
                                    {paymentMethod === 'credit' && <div className="w-[6px] h-[6px] rounded-full bg-white dark:bg-black" />}
                                 </div>
                                 <span className="text-[14px] font-medium text-[#323232] dark:text-white">Credit card</span>
                              </div>
                              <div className="flex gap-1.5 overflow-hidden">
                                 <div className="w-[34px] h-[22px] bg-white border border-[#d9d9d9] rounded-[3px] text-[9px] flex items-center justify-center font-bold text-[#142168] italic tracking-tight shadow-sm">VISA</div>
                                 <div className="w-[34px] h-[22px] bg-white border border-[#d9d9d9] rounded-[3px] text-[9px] flex items-center justify-center font-bold text-[#eb001b] italic tracking-tight shadow-sm">MC</div>
                                 <div className="w-[34px] h-[22px] bg-[#2575d3] border border-[#d9d9d9] rounded-[3px] text-[8px] flex items-center justify-center font-bold text-white italic tracking-tight shadow-sm">AMEX</div>
                                 <div className="w-[34px] h-[22px] bg-white border border-[#d9d9d9] rounded-[3px] text-[10px] flex items-center justify-center font-medium text-[#737373] shadow-sm">+5</div>
                              </div>
                           </div>

                           <AnimatePresence>
                              {paymentMethod === 'credit' && (
                                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="p-4 flex flex-col gap-3 border-t border-[#d9d9d9] dark:border-stone-800">
                                       <div className="relative">
                                          <input type="text" placeholder="Card number" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ababab]"><Lock size={15} /></div>
                                       </div>
                                       <div className="grid grid-cols-2 gap-3">
                                          <input type="text" placeholder="Expiration date (MM / YY)" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                          <div className="relative">
                                             <input type="text" placeholder="Security code" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#000] cursor-help"><Info size={16} /></div>
                                          </div>
                                       </div>
                                       <input type="text" placeholder="Name on card" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />

                                       <div className="px-1 py-1 mt-1 flex items-center gap-2">
                                          <input
                                             type="checkbox"
                                             id="diffBilling"
                                             className="w-[18px] h-[18px] rounded-[4px] border-[#d9d9d9] dark:border-stone-800 checked:bg-[#000] dark:checked:bg-white cursor-pointer"
                                             onChange={(e) => setShowBilling(!e.target.checked)}
                                             defaultChecked
                                          />
                                          <label htmlFor="diffBilling" className="text-[14px] text-[#323232] dark:text-stone-300 cursor-pointer">Use shipping address as billing address</label>
                                       </div>

                                       <AnimatePresence>
                                          {showBilling && (
                                             <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="flex flex-col gap-3 pt-4 overflow-hidden"
                                             >
                                                <h2 className="text-xl font-medium text-[#323232] dark:text-white tracking-tight mb-1">Billing address</h2>
                                                <div className="relative">
                                                   <select className="w-full p-[14px] pt-5 border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-stone-950 dark:text-white shadow-sm focus:ring-1 focus:ring-[#000] focus:border-[#000]">
                                                      <option>United States</option>
                                                      <option>United Kingdom</option>
                                                      <option>Canada</option>
                                                      <option>Australia</option>
                                                      <option>Germany</option>
                                                      <option>France</option>
                                                      <option>Italy</option>
                                                      <option>Spain</option>
                                                      <option>Netherlands</option>
                                                      <option>Japan</option>
                                                      <option>South Korea</option>
                                                   </select>
                                                   <div className="absolute top-1.5 left-[15px] text-[11px] text-[#737373]">Country/Region</div>
                                                   <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                   <input type="text" placeholder="First name" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                                   <input type="text" placeholder="Last name" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                                </div>
                                                <input type="text" placeholder="Address" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                                <div className="grid grid-cols-3 gap-3">
                                                   <input type="text" placeholder="City" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                                   <div className="relative">
                                                      <select className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] appearance-none text-[14px] font-normal outline-none bg-white dark:bg-stone-950 dark:text-white shadow-sm focus:ring-1 focus:ring-[#000] focus:border-[#000]">
                                                         <option>State</option>
                                                      </select>
                                                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373]" />
                                                   </div>
                                                   <input type="text" placeholder="ZIP code" className="w-full p-[14px] border border-[#d9d9d9] dark:border-stone-800 rounded-[4px] text-[14px] font-normal outline-none focus:ring-1 focus:ring-[#000] focus:border-[#000] shadow-sm placeholder:text-[#ababab] bg-white dark:bg-stone-950 dark:text-white" />
                                                </div>
                                             </motion.div>
                                          )}
                                       </AnimatePresence>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>

                        {/* PayPal Wrapper */}
                        <div
                           className={`flex flex-col transition-all relative z-10 ${paymentMethod === 'paypal'
                                 ? 'bg-[#fafafa] dark:bg-stone-900'
                                 : 'border-b border-[#d9d9d9] dark:border-stone-800 bg-white dark:bg-stone-950 hover:bg-[#fafafa]'
                              }`}
                        >
                           <div
                              className={`p-[18px] flex items-center justify-between cursor-pointer rounded-[4px] transition-all ${paymentMethod === 'paypal'
                                    ? 'border-[1.5px] border-black dark:border-white'
                                    : ''
                                 }`}
                              onClick={() => setPaymentMethod("paypal")}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'paypal' ? 'border-[#000] dark:border-white bg-[#000] dark:bg-white' : 'border-[#d9d9d9] dark:border-stone-700'}`}>
                                    {paymentMethod === 'paypal' && <div className="w-[6px] h-[6px] rounded-full bg-white dark:bg-black" />}
                                 </div>
                                 <span className="text-[14px] font-medium text-[#323232] dark:text-white">PayPal</span>
                              </div>
                              <Image src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_150x38.png" alt="PayPal" width={65} height={18} className="object-contain" />
                           </div>

                           <AnimatePresence>
                              {paymentMethod === 'paypal' && (
                                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="p-10 flex items-center justify-center border-t border-[#d9d9d9] dark:border-stone-800">
                                       <div className="flex flex-col items-center gap-4 text-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-400">
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          <span className="text-[14px] text-[#323232] dark:text-stone-300">You'll be redirected to PayPal to complete your purchase.</span>
                                       </div>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>

                        {/* Klarna Wrapper */}
                        <div
                           className={`flex flex-col transition-all relative z-10 ${
                              paymentMethod === 'klarna'
                                 ? 'bg-[#fafafa] dark:bg-stone-900'
                                 : 'bg-white dark:bg-stone-950 rounded-b-[3px] hover:bg-[#fafafa]'
                           }`}
                           >
                           <div
                              className={`p-[18px] flex items-center justify-between cursor-pointer rounded-[4px] transition-all ${
                                 paymentMethod === 'klarna'
                                 ? 'border-[1.5px] border-black dark:border-white'
                                 : 'rounded-b-[3px]'
                              }`}
                              onClick={() => setPaymentMethod("klarna")}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'klarna' ? 'border-[#000] dark:border-white bg-[#000] dark:bg-white' : 'border-[#d9d9d9] dark:border-stone-700'}`}>
                                    {paymentMethod === 'klarna' && <div className="w-[6px] h-[6px] rounded-full bg-white dark:bg-black" />}
                                 </div>
                                 <span className="text-[14px] font-medium text-[#323232] dark:text-white">Klarna - Flexible payments</span>
                              </div>
                              <div className="px-2.5 py-[5px] bg-[#ffb3c7] text-[#191919] text-[11px] font-bold rounded-[3px] tracking-tight">Klarna</div>
                           </div>

                           <AnimatePresence>
                              {paymentMethod === 'klarna' && (
                                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="p-10 flex items-center justify-center border-t border-[#d9d9d9] dark:border-stone-800">
                                       <div className="flex flex-col items-center gap-4 text-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-400">
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          <span className="text-[14px] text-[#323232] dark:text-stone-300">You'll be redirected to Klarna to complete your purchase.</span>
                                       </div>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>

                     </div>
                  </div>

                  <button type="submit" disabled={isProcessing} className="w-full h-[60px] flex items-center justify-center bg-[#000] text-white text-[15px] font-bold rounded-[4px] hover:opacity-90 transition-all shadow-md mt-4 mb-24 disabled:opacity-70">
                     {isProcessing ? <Loader2 className="animate-spin" /> : "Pay now"}
                  </button>
               </form>
            </div>
         </div>

         {/* RIGHT: Order Summary (Dark Green Background - Hidden on Mobile) */}
         <div className="hidden lg:block w-[45%] bg-[#18261e] lg:min-h-screen pt-16 lg:pt-24 pb-12 px-6 lg:pl-[4%] lg:pr-12">
            <div className="w-full max-w-[420px] flex flex-col lg:sticky lg:top-37">
               {/* Header */}
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-white text-[22px] font-serif uppercase tracking-wider">FLEÑJURE</h2>
                  <ShoppingBag className="text-white" size={20} strokeWidth={1} />
               </div>

               {/* Product Items */}
               <div className="flex flex-col gap-6 mb-7">
                  {items.map((item, idx) => (
                     <div key={idx} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-white border border-[#2a3a30] rounded-[6px] overflow-hidden flex-shrink-0">
                           <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain p-2"
                           />
                           <div className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-[rgba(114,114,114,0.9)] rounded-full flex items-center justify-center text-[11px] text-white font-medium z-10 shadow-sm">
                              {item.quantity}
                           </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                           <span className="text-white text-[14px] font-medium leading-tight">{item.name}</span>
                           <span className="text-[#a5b0aa] text-[12px] font-normal mt-1 block">{item.size}</span>
                        </div>
                        <span className="text-white text-[14px] font-medium pl-2">${(parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}</span>
                     </div>
                  ))}
               </div>

               {/* Discount Code */}
               <div className="flex gap-3 mb-6">
                  <input
                     type="text"
                     placeholder="Discount code or gift card"
                     className="flex-1 bg-white p-[14px] text-stone-900 text-[14px] placeholder:text-[#737373] outline-none rounded-[4px] shadow-sm border border-transparent focus:ring-1 focus:border-[#000] focus:ring-[#000]"
                  />
                  <button className="px-6 py-[14px] bg-[#1f3025] text-white text-[14px] font-medium rounded-[4px] border border-[#2a3d31] hover:bg-[#25392b] transition-all disabled:opacity-50" disabled>
                     Apply
                  </button>
               </div>

               {/* Subtotal / Shipping / Total */}
               <div className="flex flex-col gap-[14px] border-y border-[#2a3d31] py-5 mb-5">
                  <div className="flex justify-between items-center text-[14px]">
                     <span className="text-white font-normal">Subtotal · {items.length} {items.length === 1 ? 'item' : 'items'}</span>
                     <span className="text-white font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                     <span className="text-white font-normal">Shipping</span>
                     <span className="text-[#a5b0aa]">Enter shipping address</span>
                  </div>
               </div>

               <div className="flex justify-between items-center">
                  <span className="text-white text-xl font-medium tracking-tight">Total</span>
                  <div className="flex items-center gap-2">
                     <span className="text-[#a5b0aa] text-[12px] font-normal mt-1">USD</span>
                     <span className="text-[24px] text-white font-semibold tabular-nums tracking-tight">${cartTotal.toFixed(2)}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
