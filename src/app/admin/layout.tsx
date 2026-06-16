"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  Users, 
  Receipt, 
  LogOut, 
  Loader2, 
  Menu, 
  X,
  Compass,
  Search,
  Bell,
  Music,
  Coffee,
  Megaphone,
  Trash2,
  Sun,
  Moon,
  FolderKanban,
  Mail
} from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[36px] w-full" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-white transition-all duration-200 mb-1"
    >
      {theme === "dark" ? <Sun size={16} strokeWidth={2} className="opacity-80" /> : <Moon size={16} strokeWidth={2} className="opacity-80" />}
      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, time: string}[]>([]);

  useEffect(() => {
    async function checkAuth() {
      // Allow local development bypass if env keys aren't set yet
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (pathname !== "/admin/login") {
            router.push("/admin/login");
          } else {
            setLoading(false);
          }
          return;
        }

        // Removed strict profile check since not all initialized admin users have a profile row
        setAuthorized(true);
        if (pathname === "/admin/login") {
          router.push("/admin/dashboard");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Setup Supabase Realtime Subscription via Broadcast
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'broadcast',
        { event: 'new-order' },
        (payload) => {
          console.log('New order received via broadcast!', payload);
          setHasUnreadNotifications(true);
          const newOrder = payload.payload;
          setNotifications(prev => [{
            id: newOrder.id,
            message: `New order ${newOrder.id} received for $${newOrder.total_amount}`,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }, ...prev].slice(0, 5));
        }
      )
      .on(
        'broadcast',
        { event: 'new-subscriber' },
        (payload) => {
          console.log('New subscriber received via broadcast!', payload);
          setHasUnreadNotifications(true);
          const newSub = payload.payload;
          setNotifications(prev => [{
            id: newSub.id,
            message: `New subscriber: ${newSub.email}`,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    const isMissingEnv = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isMissingEnv) {
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-stone-900 dark:text-white">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={32} />
        <span className="text-xs uppercase tracking-widest text-stone-500">Securing Flenjure Admin Hub...</span>
      </div>
    );
  }

  // If on login page, render children directly (no sidebar layout)
  if (pathname === "/admin/login") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="flenjure-admin-theme">
        {children}
      </ThemeProvider>
    );
  }

  if (!authorized) {
    return null;
  }

  const menuGroups = [
    {
      title: "Main",
      items: [
        { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "Store",
      items: [
        { name: "Orders", href: "/admin/orders", icon: Receipt },
        { name: "Customers", href: "/admin/customers", icon: User },
        { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
        { name: "Carts", href: "/admin/crm", icon: ShoppingBag },
        { name: "Products", href: "/admin/products", icon: FolderKanban },
      ]
    },
    {
      title: "Content",
      items: [
        { name: "Cafe", href: "/admin/cafe", icon: Coffee },
        { name: "Audio", href: "/admin/audio", icon: Music },
        { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      ]
    },
    {
      title: "System",
      items: [
        { name: "Recycle Bin", href: "/admin/recycle-bin", icon: Trash2 },
      ]
    }
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="flenjure-admin-theme">
      <div className="h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] text-stone-900 dark:text-stone-100 flex flex-col md:flex-row transition-all duration-300 font-sans font-light tracking-[0.015em] overflow-hidden">
        
        <div className="md:hidden bg-white dark:bg-[#111] border-b border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <Image 
              src="/favicon.png" 
              alt="Flenjure Icon" 
              width={32} 
              height={32} 
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-stone-600 dark:text-stone-400 p-1"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 w-64 bg-[#f4f4f4] dark:bg-[#111] border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between z-40 transform transition-transform duration-300 md:relative md:transform-none md:shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Logo Brand area */}
            <div className="p-5 flex items-center justify-between sticky top-0 bg-[#f4f4f4] dark:bg-[#111] z-10">
              <Link href="/admin/dashboard" className="flex items-center">
                <Image 
                  src="/favicon.png" 
                  alt="Flenjure Icon" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </Link>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-stone-500 hover:text-stone-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="px-3 pb-6 flex flex-col gap-5">
              {menuGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="flex flex-col gap-1">
                  {group.title !== "Main" && (
                    <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                      {group.title}
                    </span>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200 group
                          ${isActive 
                            ? "bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white" 
                            : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-white"}
                        `}
                      >
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "" : "opacity-80"} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* User profile footer item */}
          <div className="p-3 border-t border-stone-200 dark:border-stone-800">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-white transition-all duration-200 mb-1"
            >
              <Compass size={16} strokeWidth={2} className="opacity-80" />
              <span>Storefront</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
            >
              <LogOut size={16} strokeWidth={2} className="opacity-80" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navigation Bar (Shopify Style) */}
        <header className="hidden md:flex h-14 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111] items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = e.currentTarget.value.trim();
                  if (query) {
                    router.push(`/admin/products?q=${encodeURIComponent(query)}`);
                  } else {
                    router.push('/admin/products');
                  }
                }
              }}
              className="w-full bg-stone-100 dark:bg-stone-900 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-stone-900 dark:focus:border-stone-500 rounded-md pl-9 pr-4 py-1.5 text-sm outline-none transition-all duration-200 text-stone-900 dark:text-white placeholder:text-stone-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-4 pl-4 relative">
            <button 
              className="relative text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasUnreadNotifications(false);
              }}
            >
              <Bell size={18} />
              {hasUnreadNotifications && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-stone-950"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-full right-10 mt-2 w-80 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                      <div key={idx} onClick={() => { setShowNotifications(false); router.push('/admin/orders'); }} className="px-4 py-3 border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-900/50 cursor-pointer transition-colors">
                        <p className="text-sm text-stone-800 dark:text-stone-200 font-medium">{notif.message}</p>
                        <span className="text-xs text-stone-500 mt-1 block">{notif.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-stone-500 text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-center">
                  <button onClick={() => { setShowNotifications(false); router.push('/admin/orders'); }} className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white">
                    View all orders
                  </button>
                </div>
              </div>
            )}
            <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer">
              FP
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar min-h-0">
          <div className="max-w-6xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ThemeProvider>
  );
}
