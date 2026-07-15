"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCustomerOrders } from "@/app/admin/actions";
import { Loader2, Package, ArrowLeft, Clock } from "lucide-react";

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUser(session.user);
      
      try {
        const userOrders = await getCustomerOrders(session.user.email!);
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc] dark:bg-black">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fcfcfc] dark:bg-black items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <h1 className="text-3xl font-serif font-light tracking-tight text-stone-900 dark:text-white">
            Access <span className="italic text-stone-400">Denied</span>
          </h1>
          <p className="text-stone-500 font-light mt-4 max-w-md">
            Please log in to view your order history.
          </p>
          <Link href="/account" className="mt-8 px-8 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-300">
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fcfcfc] dark:bg-black">
      <div className="max-w-4xl mx-auto w-full">
        <Link href="/account" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white mb-12 transition-colors">
          <ArrowLeft size={14} /> Back to Portal
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 mb-12"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">History</span>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-stone-900 dark:text-white">
            Your <span className="italic text-stone-400">Orders</span>
          </h1>
        </motion.div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 shadow-sm">
            <Package size={32} className="mx-auto text-stone-300 dark:text-stone-700 mb-4" />
            <p className="text-stone-500 font-light">You haven't placed any orders yet.</p>
            <Link href="/shop" className="inline-block mt-6 text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white border-b border-stone-900 dark:border-white pb-1">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              let items = [];
              try {
                items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              } catch (e) {
                try {
                  items = typeof order.line_items === 'string' ? JSON.parse(order.line_items) : order.line_items;
                } catch(e2) {}
              }

              return (
                <div key={order.id} className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-sm flex flex-col gap-6 transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-100 dark:border-stone-800/50 pb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Order Number</span>
                      <h3 className="font-mono text-sm text-stone-900 dark:text-white">{order.id}</h3>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Date</span>
                        <span className="text-sm text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                          <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Total</span>
                        <span className="text-sm text-stone-900 dark:text-white font-medium">${Number(order.total_amount || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Status</span>
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded">
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {items && items.length > 0 ? items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img src={item.image} alt={item.title || item.name} className="w-12 h-12 object-cover rounded-sm bg-stone-50 dark:bg-stone-900" />
                          ) : (
                            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-sm flex items-center justify-center">
                              <Package size={16} className="text-stone-300" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-stone-900 dark:text-white">{item.title || item.name || `Item ${item.id}`}</p>
                            <p className="text-xs text-stone-500">Qty: {item.quantity || item.q || 1}</p>
                          </div>
                        </div>
                        <span className="text-sm text-stone-900 dark:text-white">${Number(item.price || 0).toFixed(2)}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-stone-500 italic">No item details available.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
