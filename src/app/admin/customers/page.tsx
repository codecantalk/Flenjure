"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "../actions";
import { 
  Loader2,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  ShoppingBag,
  Users
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
                <tr key={customer.id} className="border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock size={12} /> {new Date(customer.last_order_date).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
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
