"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderKanban, 
  Receipt, 
  Users, 
  LogOut, 
  Loader2, 
  Menu, 
  X,
  Compass,
  Search,
  Bell
} from "lucide-react";

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
    return <>{children}</>;
  }

  if (!authorized) {
    return null;
  }

  const menuItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Collections", href: "/admin/collections", icon: FolderKanban },
    { name: "Orders", href: "/admin/orders", icon: Receipt },
    { name: "CRM / Carts", href: "/admin/crm", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] text-stone-900 dark:text-stone-100 flex flex-col md:flex-row transition-all duration-300 font-sans font-light tracking-[0.015em]">
      
      <div className="md:hidden bg-white dark:bg-[#111] border-b border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between z-30">
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

      {/* Sidebar Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#f4f4f4] dark:bg-[#111] border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between z-40 transform transition-transform duration-300 md:relative md:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div>
          {/* Logo Brand area */}
          <div className="p-5 flex items-center justify-between">
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
          <nav className="px-3 py-2 flex flex-col gap-1">
            {menuItems.map((item) => {
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
          </nav>
        </div>

        {/* User profile footer item */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800">
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
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navigation Bar (Shopify Style) */}
        <header className="hidden md:flex h-14 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111] items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full bg-stone-100 dark:bg-stone-900 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-stone-900 dark:focus:border-stone-500 rounded-md pl-9 pr-4 py-1.5 text-sm outline-none transition-all duration-200 text-stone-900 dark:text-white placeholder:text-stone-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-4 pl-4">
            <button className="text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors">
              <Bell size={18} />
            </button>
            <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer">
              FP
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
