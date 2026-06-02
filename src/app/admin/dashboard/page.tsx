"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { getDashboardStats } from "../actions";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Loader2
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function AdminDashboardPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [carts, setCarts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchRealData() {
      try {
        const { orders, carts } = await getDashboardStats();
        setOrders(orders || []);
        setCarts(carts || []);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRealData();
  }, []);

  const stats = useMemo(() => {
    const totalRev = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const activeCarts = carts.filter(c => !c.is_recovered);
    return {
      revenue: totalRev,
      ordersCount: orders.length,
      activeCarts: activeCarts.length,
      avgValue: orders.length ? totalRev / orders.length : 0
    };
  }, [orders, carts]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const abandonedCarts = useMemo(() => carts.filter(c => !c.is_recovered).slice(0, 5), [carts]);

  // Aggregate revenue by date (last 30 days)
  const chartData = useMemo(() => {
    if (!orders.length) return [];
    const days: Record<string, number> = {};
    const now = new Date();
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    
    orders.forEach(o => {
      if (!o.created_at) return;
      const dateStr = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (days[dateStr] !== undefined) {
        days[dateStr] += Number(o.total_amount || 0);
      }
    });

    return Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
  }, [orders]);

  // Aggregate top products
  const topProducts = useMemo(() => {
    if (!orders.length) return [];
    const products: Record<string, number> = {};
    orders.forEach(o => {
      let items = [];
      try {
        items = typeof o.line_items === 'string' ? JSON.parse(o.line_items) : o.line_items;
      } catch(e) {}
      
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const name = item.title || item.name || "Unknown Item";
          const qty = Number(item.quantity || 1);
          products[name] = (products[name] || 0) + qty;
        });
      }
    });
    
    return Object.entries(products)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  const statsCards = [
    { name: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, change: "All time" },
    { name: "Orders Fulfilled", value: stats.ordersCount, icon: ShoppingBag, change: "All time" },
    { name: "Abandoned Carts", value: stats.activeCarts, icon: Users, change: "Requires attention" },
    { name: "Avg Order Value", value: `$${stats.avgValue.toFixed(2)}`, icon: TrendingUp, change: "All time" }
  ];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  // Theme support for charts
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const chartColor = isDark ? "#ffffff" : "#1c1917";
  const gridColor = isDark ? "#292524" : "#e7e5e4";
  const textColor = isDark ? "#a8a29e" : "#78716c";
  const tooltipBg = isDark ? "#111111" : "#ffffff";
  const tooltipBorder = isDark ? "#292524" : "#e7e5e4";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-white">Overview</h2>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">{card.name}</span>
                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
                  <Icon size={16} className="text-stone-600 dark:text-stone-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-stone-900 dark:text-white">{card.value}</h3>
                <span className="text-xs text-stone-500 mt-1 block font-medium">{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-stone-900 dark:text-white mb-6">Revenue Trend (Last 30 Days)</h3>
          <div className="h-72 w-full">
            {mounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={isDark ? 0.2 : 0.3}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: textColor }} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: textColor }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, fontSize: '14px' }}
                    itemStyle={{ color: chartColor, fontWeight: 600 }}
                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={chartColor} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-500">Not enough data to graph yet.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-stone-900 dark:text-white mb-6">Top Selling Products</h3>
          <div className="h-72 w-full">
            {mounted && topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fill: textColor }} />
                  <Tooltip 
                    cursor={{fill: isDark ? '#292524' : '#f5f5f4'}}
                    contentStyle={{ borderRadius: '8px', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, fontSize: '14px' }}
                    itemStyle={{ color: chartColor, fontWeight: 600 }}
                  />
                  <Bar dataKey="sales" fill={chartColor} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-500">Not enough data to graph yet.</div>
            )}
          </div>
        </div>
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
                      <Link href="/admin/orders" className="hover:underline">{order.id.split('-')[0]}</Link>
                    </td>
                    <td className="px-5 py-4 text-stone-500 text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-5 py-4">{order.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border
                        ${order.status === "paid" ? "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700" : "bg-yellow-50 text-yellow-800 border-yellow-200"}
                      `}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium">${Number(order.total_amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-stone-500">No recent orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Abandoned Cart CRM Sideboard */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">Abandoned Carts</h3>
            <Link href="/admin/crm" className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
              Recover
            </Link>
          </div>

          <div className="space-y-4">
            {abandonedCarts.map((cart) => {
              let itemsCount = 0;
              try {
                const parsedItems = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
                itemsCount = Array.isArray(parsedItems) ? parsedItems.length : 0;
              } catch(e) {}
              
              return (
                <div key={cart.id} className="flex flex-col gap-2 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-500">
                      {cart.created_at ? new Date(cart.created_at).toLocaleDateString() : ""}
                    </span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-white">${Number(cart.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{cart.email || "Guest"}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {itemsCount} {itemsCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              );
            })}
            {abandonedCarts.length === 0 && (
              <div className="text-sm text-stone-500 text-center py-4">No abandoned carts right now!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
