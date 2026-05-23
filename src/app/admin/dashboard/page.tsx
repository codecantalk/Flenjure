"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 4820.00,
    ordersCount: 42,
    activeCarts: 8,
    avgValue: 114.76
  });
  const [recentOrders, setRecentOrders] = useState([
    { id: "FL-1002", email: "client@flenjure.com", total: 180.00, status: "pending", date: "2 mins ago" },
    { id: "FL-1001", email: "james@example.com", total: 220.00, status: "paid", date: "1 hour ago" },
    { id: "FL-1000", email: "sophie@trend.co", total: 95.00, status: "shipped", date: "3 hours ago" },
    { id: "FL-0999", email: "customer@domain.com", total: 310.00, status: "paid", date: "1 day ago" }
  ]);
  const [abandonedCarts, setAbandonedCarts] = useState([
    { id: "cart_01", email: "lost@gmail.com", itemsCount: 3, value: 290.00, time: "45 mins ago" },
    { id: "cart_02", email: "unconverted@yahoo.com", itemsCount: 1, value: 85.00, time: "2 hours ago" }
  ]);

  useEffect(() => {
    async function fetchRealData() {
      // Check if Supabase keys exist
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) return;

      try {
        // Fetch real orders count and revenue
        const { data: orders } = await supabase.from("orders").select("total_amount, status");
        const { data: carts } = await supabase.from("cart_sessions").select("id").eq("is_recovered", false);

        if (orders && orders.length > 0) {
          const totalRev = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
          setStats({
            revenue: totalRev,
            ordersCount: orders.length,
            activeCarts: carts?.length || 0,
            avgValue: totalRev / orders.length
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    }

    fetchRealData();
  }, []);

  const statsCards = [
    { name: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, change: "+12.4% vs last week", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Orders Fulfilled", value: stats.ordersCount, icon: ShoppingBag, change: "+8.2% vs last week", color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Active Carts / Leads", value: stats.activeCarts, icon: Users, change: "CRM tracking active", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Average Order Value", value: `$${stats.avgValue.toFixed(2)}`, icon: TrendingUp, change: "+4.1% vs last week", color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  return (
    <div className="space-y-10 selection:bg-amber-500 selection:text-black">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-serif font-light text-white">Hub Overview</h2>
        <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Realtime telemetry and metrics</p>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-stone-900/40 border border-stone-850 rounded-2xl p-6 flex flex-col justify-between hover:border-stone-800 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">{card.name}</span>
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-light tracking-tight text-white">{card.value}</h3>
                <span className="text-[10px] text-stone-500 mt-1 block">{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Section */}
        <div className="lg:col-span-8 bg-stone-900/20 border border-stone-850 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-serif font-light text-white">Recent Orders</h3>
              <p className="text-xs text-stone-500">Manual & Express purchases</p>
            </div>
            <Link href="/admin/orders" className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 group font-medium uppercase tracking-wider">
              <span>View All</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-400">
              <thead className="text-[10px] uppercase tracking-wider text-stone-500 border-b border-stone-850">
                <tr>
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/40">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-900/10">
                    <td className="py-4 font-mono font-medium text-amber-500/80">{order.id}</td>
                    <td className="py-4 text-white font-light">{order.email}</td>
                    <td className="py-4 font-medium text-white">${order.total.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider
                        ${order.status === "paid" && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}
                        ${order.status === "pending" && "bg-amber-500/10 text-amber-500 border border-amber-500/20"}
                        ${order.status === "shipped" && "bg-blue-500/10 text-blue-500 border border-blue-500/20"}
                      `}>
                        {order.status === "paid" && <CheckCircle size={10} />}
                        {order.status === "pending" && <Clock size={10} />}
                        {order.status === "shipped" && <CheckCircle size={10} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-stone-500 text-right text-xs">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Abandoned Cart CRM Sideboard */}
        <div className="lg:col-span-4 bg-stone-900/20 border border-stone-850 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-serif font-light text-white">Abandoned Leads</h3>
              <p className="text-xs text-stone-500">Unrecovered shopping carts</p>
            </div>
            <Link href="/admin/crm" className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 group font-medium uppercase tracking-wider">
              <span>Fulfill</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {abandonedCarts.map((cart) => (
              <div key={cart.id} className="p-4 rounded-xl bg-stone-900/40 border border-stone-850 hover:border-stone-800 transition-all duration-300 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-stone-500 block uppercase">{cart.time}</span>
                  <h4 className="text-xs font-medium text-white truncate max-w-[160px]">{cart.email}</h4>
                  <p className="text-[10px] text-stone-500">
                    {cart.itemsCount} {cart.itemsCount === 1 ? "item" : "items"} inside • <span className="text-amber-500/80 font-medium">${cart.value.toFixed(2)}</span>
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <AlertCircle size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
