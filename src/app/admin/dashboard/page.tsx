"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "../actions";
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
      try {
        const { orders, carts } = await getDashboardStats();

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
    { name: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, change: "+12.4% vs last week" },
    { name: "Orders Fulfilled", value: stats.ordersCount, icon: ShoppingBag, change: "+8.2% vs last week" },
    { name: "Active Carts / Leads", value: stats.activeCarts, icon: Users, change: "CRM tracking active" },
    { name: "Average Order Value", value: `$${stats.avgValue.toFixed(2)}`, icon: TrendingUp, change: "+4.1% vs last week" }
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Overview</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm font-medium border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111] text-stone-900 dark:text-white rounded-md shadow-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
            Today
          </button>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">{card.name}</span>
                <Icon size={16} className="text-stone-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-stone-900 dark:text-white">{card.value}</h3>
                <span className="text-xs text-stone-500 mt-1 block font-medium">{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 font-medium">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-900 dark:text-stone-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-stone-900 dark:text-white">
                      <Link href="/admin/orders" className="hover:underline">{order.id}</Link>
                    </td>
                    <td className="px-5 py-4 text-stone-500 text-xs">{order.date}</td>
                    <td className="px-5 py-4">{order.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border
                        ${order.status === "paid" && "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700"}
                        ${order.status === "pending" && "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700"}
                        ${order.status === "shipped" && "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700"}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium">${order.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Abandoned Cart CRM Sideboard */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">Abandoned Carts</h3>
            <Link href="/admin/crm" className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
              Fulfill
            </Link>
          </div>

          <div className="space-y-4">
            {abandonedCarts.map((cart) => (
              <div key={cart.id} className="flex flex-col gap-2 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-stone-500">{cart.time}</span>
                  <span className="text-sm font-semibold text-stone-900 dark:text-white">${cart.value.toFixed(2)}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{cart.email}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {cart.itemsCount} {cart.itemsCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
