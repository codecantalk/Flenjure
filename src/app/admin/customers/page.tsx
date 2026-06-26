"use client";

import React, { useEffect, useState, Fragment } from "react";
import { getCustomers } from "../actions";
import { 
  Loader2,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  ShoppingBag,
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_spent: number;
  orders_count: number;
  last_order_date: string;
  recent_orders: any[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) {
        setCustomers([
          {
            id: "test@example.com",
            name: "John Doe",
            email: "test@example.com",
            phone: "+1234567890",
            total_spent: 250.00,
            orders_count: 2,
            last_order_date: new Date().toISOString(),
            recent_orders: []
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        const data = await getCustomers();
        setCustomers(data as Customer[]);
      } catch (err) {
        console.error("Error loading customers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <Users size={24} /> Customer Directory
            </h1>
            <p className="text-sm text-stone-500 mt-1">Aggregated profiles from your order history</p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
                <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Customer</th>
                <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Contact</th>
                <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Orders</th>
                <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Total Spent</th>
                <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase text-right">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <Fragment key={customer.id}>
                  <tr 
                    onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                    className="border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-sm text-stone-900 dark:text-white">{customer.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                          <Mail size={12} /> {customer.email}
                        </div>
                        {customer.phone !== "Unknown" && (
                          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                            <Phone size={12} /> {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                        <ShoppingBag size={12} /> {customer.orders_count}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-sm text-stone-900 dark:text-white">
                      ${customer.total_spent.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-sm text-stone-500 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} /> {new Date(customer.last_order_date).toLocaleDateString()}
                        </div>
                        {expandedCustomer === customer.id ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
                      </div>
                    </td>
                  </tr>
                  {expandedCustomer === customer.id && (
                    <tr className="bg-stone-50/50 dark:bg-stone-900/20 border-b border-stone-100 dark:border-stone-800/50">
                      <td colSpan={5} className="p-0">
                        <div className="px-8 py-6">
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-4">Order History</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {customer.recent_orders.map((order: any, idx: number) => (
                              <div key={order.id || idx} className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-lg p-4 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="text-sm font-medium text-stone-900 dark:text-white">Order #{order.id?.slice(0, 8)}</div>
                                    <div className="text-xs text-stone-500">{new Date(order.created_at).toLocaleString()}</div>
                                  </div>
                                  <div className="text-sm font-medium text-stone-900 dark:text-white">${Number(order.total_amount || 0).toFixed(2)}</div>
                                </div>
                                <div className="space-y-2 flex-grow">
                                  {order.items?.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
                                      <span className="truncate pr-2">{item.quantity}x {item.name} {item.size && item.size !== 'OS' ? `(${item.size})` : ''}</span>
                                      <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                {order.status && (
                                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full">{order.status}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-stone-500 text-sm">No customers found. Customers are generated when orders are placed.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
