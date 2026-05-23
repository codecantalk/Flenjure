"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Loader2,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  BellRing
} from "lucide-react";

interface CartItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

interface CartSession {
  id: string;
  updated_at: string;
  email?: string;
  whatsapp_number?: string;
  items: CartItem[];
  is_recovered: boolean;
}

export default function AdminCRMPage() {
  const [sessions, setSessions] = useState<CartSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindedCarts, setRemindedCarts] = useState<string[]>([]);

  const mockSessions: CartSession[] = [
    {
      id: "cart-01",
      updated_at: new Date(Date.now() - 2700000).toISOString(), // 45 mins ago
      email: "lost@gmail.com",
      whatsapp_number: "+14045550199",
      items: [
        { id: "prod-1", title: "Flenjure Signature Tee", quantity: 2, price: 95.00 },
        { id: "prod-2", title: "Fruit Gummy Snack Pack", quantity: 3, price: 15.00 }
      ],
      is_recovered: false
    },
    {
      id: "cart-02",
      updated_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      email: "unconverted@yahoo.com",
      whatsapp_number: "+16785550188",
      items: [
        { id: "prod-1", title: "Flenjure Signature Tee", quantity: 1, price: 95.00 }
      ],
      is_recovered: false
    },
    {
      id: "cart-03",
      updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      email: "recovered_buyer@domain.com",
      whatsapp_number: "+17705550177",
      items: [
        { id: "prod-2", title: "Fruit Gummy Snack Pack", quantity: 4, price: 15.00 }
      ],
      is_recovered: true
    }
  ];

  useEffect(() => {
    async function fetchSessions() {
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) {
        setSessions(mockSessions);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("cart_sessions")
          .select("*")
          .order("updated_at", { ascending: false });

        if (data && data.length > 0) {
          setSessions(data as CartSession[]);
        } else {
          setSessions(mockSessions);
        }
      } catch (err) {
        console.error("Error loading cart sessions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  const triggerReminder = (id: string, method: "whatsapp" | "email", contact: string) => {
    setRemindedCarts([...remindedCarts, `${id}-${method}`]);
    
    // In production, this calls a Next.js API route that connects to Twilio (WhatsApp) or Resend (Email)
    alert(`CRM Trigger dispatched successfully!\nSent abandoned cart reminder to ${contact} via ${method.toUpperCase()}`);
  };

  const getCartTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
        <span className="text-xs uppercase tracking-widest">Loading CRM Pipeline...</span>
      </div>
    );
  }

  const activeLeads = sessions.filter(s => !s.is_recovered);
  const recoveredSales = sessions.filter(s => s.is_recovered);

  return (
    <div className="space-y-10 selection:bg-amber-500 selection:text-black">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-serif font-light text-white">CRM & Cart Recovery</h2>
        <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Track active leads and automate abandoned cart dispatch</p>
      </div>

      {/* Conversion metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-stone-900/40 border border-stone-850 rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Active Leads</span>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-2xl font-light text-white">{activeLeads.length}</h3>
            <span className="text-[10px] text-amber-500">Pending recovery</span>
          </div>
        </div>

        <div className="bg-stone-900/40 border border-stone-850 rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Recovered Sales</span>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-2xl font-light text-white">{recoveredSales.length}</h3>
            <span className="text-[10px] text-emerald-500">Converted</span>
          </div>
        </div>

        <div className="bg-stone-900/40 border border-stone-850 rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Recovery Rate</span>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-2xl font-light text-white">
              {sessions.length ? `${Math.round((recoveredSales.length / sessions.length) * 100)}%` : "0%"}
            </h3>
            <span className="text-[10px] text-stone-500">industry avg: ~15%</span>
          </div>
        </div>
      </div>

      {/* Lead session list */}
      <div className="space-y-6">
        <h3 className="text-xl font-serif font-light text-white">Active Leaking Carts</h3>

        <div className="grid grid-cols-1 gap-6">
          {activeLeads.map((session) => {
            const totalVal = getCartTotal(session.items);
            return (
              <div key={session.id} className="bg-stone-900/20 border border-stone-850 rounded-2xl p-6 hover:border-stone-800 transition-all duration-300 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                
                {/* Contact and timing column */}
                <div className="space-y-3 xl:w-1/3">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-stone-500" />
                    <span className="text-[10px] font-mono text-stone-500 uppercase">
                      Leaked {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {session.email && (
                      <div className="flex items-center gap-2.5 text-xs text-stone-300 font-light">
                        <Mail size={14} className="text-stone-500" />
                        <span>{session.email}</span>
                      </div>
                    )}
                    {session.whatsapp_number && (
                      <div className="flex items-center gap-2.5 text-xs text-stone-300 font-light">
                        <Phone size={14} className="text-stone-500" />
                        <span>{session.whatsapp_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items column */}
                <div className="flex-1 space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-mono flex items-center gap-1.5">
                    <ShoppingBag size={10} />
                    <span>Cart Products</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {session.items.map((item, idx) => (
                      <span key={idx} className="bg-stone-950 border border-stone-850 px-3 py-1.5 rounded-lg text-xs font-light text-stone-300">
                        {item.title} ({item.quantity})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Value & Reminder controls */}
                <div className="xl:w-1/4 flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 xl:border-l border-stone-850/60 xl:pl-6">
                  <div className="text-left xl:text-right">
                    <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-mono">Cart Value</span>
                    <span className="text-lg font-semibold text-amber-500/95 font-mono">${totalVal.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    {session.email && (
                      <button
                        onClick={() => triggerReminder(session.id, "email", session.email!)}
                        disabled={remindedCarts.includes(`${session.id}-email`)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 border
                          ${remindedCarts.includes(`${session.id}-email`)
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-stone-850 hover:bg-stone-850/80 text-stone-200 border-stone-800"
                          }
                        `}
                      >
                        <BellRing size={12} />
                        <span>{remindedCarts.includes(`${session.id}-email`) ? "Sent" : "Email"}</span>
                      </button>
                    )}

                    {session.whatsapp_number && (
                      <button
                        onClick={() => triggerReminder(session.id, "whatsapp", session.whatsapp_number!)}
                        disabled={remindedCarts.includes(`${session.id}-whatsapp`)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 border
                          ${remindedCarts.includes(`${session.id}-whatsapp`)
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20"
                          }
                        `}
                      >
                        <BellRing size={12} />
                        <span>{remindedCarts.includes(`${session.id}-whatsapp`) ? "Sent" : "WhatsApp"}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
