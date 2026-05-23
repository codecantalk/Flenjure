"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
  Compass
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
        console.warn("Using local developer bypass mode because Supabase env keys are empty.");
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

        // Check if role is admin
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || profile?.role !== "admin") {
          // If not an admin, log them out and redirect to login
          await supabase.auth.signOut();
          router.push("/admin/login?error=Unauthorized");
        } else {
          setAuthorized(true);
          if (pathname === "/admin/login") {
            router.push("/admin/dashboard");
          }
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
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-white">
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
    { name: "CRM / Abandoned Carts", href: "/admin/crm", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row transition-all duration-300">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <span className="font-bold text-amber-500">F</span>
          </div>
          <span className="font-serif text-lg tracking-wider">Fleñjure Admin</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-stone-400 hover:text-white p-1"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-stone-900 border-r border-stone-800 flex flex-col justify-between z-40 transform transition-transform duration-300 md:relative md:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div>
          {/* Logo Brand area */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <span className="font-bold text-amber-500 text-lg">F</span>
              </div>
              <div>
                <h1 className="font-serif tracking-wider text-lg font-light leading-none">Fleñjure</h1>
                <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500">Custom CMS Panel</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm transition-all duration-300 group
                    ${isActive 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium" 
                      : "text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-transparent"}
                  `}
                >
                  <Icon size={18} className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer item */}
        <div className="p-4 border-t border-stone-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-all duration-300 mb-2 border border-transparent"
          >
            <Compass size={18} />
            <span>Go to Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all duration-300 border border-transparent"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-stone-950 p-6 md:p-10 min-h-screen overflow-y-auto z-10 pt-20 md:pt-10">
        {children}
      </main>
    </div>
  );
}
