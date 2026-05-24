"use client";

import { useEffect, useState } from "react";
import { getCrmSessions, updateCrmSession } from "../actions";
import { 
  Loader2,
  Mail,
  Phone,
  Clock,
  TrendingUp,
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
        { id: "prod-1", title: "Fleñjure OG Jersey", quantity: 2, price: 60.00 },
        { id: "prod-2", title: "Sour Patch Kids 226g", quantity: 3, price: 4.99 }
      ],
      is_recovered: false
    },
    {
      id: "cart-02",
      updated_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      email: "unconverted@yahoo.com",
      whatsapp_number: "+16785550188",
      items: [
        { id: "prod-1", title: "Fleñjure OG Jersey", quantity: 1, price: 60.00 }
      ],
      is_recovered: false
    },
    {
      id: "cart-03",
      updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      email: "recovered_buyer@domain.com",
      whatsapp_number: "+17705550177",
      items: [
        { id: "prod-2", title: "Sour Patch Kids 226g", quantity: 4, price: 4.99 }
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
        const data = await getCrmSessions();
        setSessions(data as CartSession[]);
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
    alert(`Reminder dispatched successfully to ${contact} via ${method.toUpperCase()}`);
  };

  const getCartTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-stone-500">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
      </div>
    );
  }

  const activeLeads = sessions.filter(s => !s.is_recovered);
  const recoveredSales = sessions.filter(s => s.is_recovered);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">CRM & Cart Recovery</h2>
      </div>

      {/* Conversion metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Active Leads</span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-semibold text-stone-900 dark:text-white">{activeLeads.length}</h3>
            <span className="text-xs font-medium text-stone-500">Pending recovery</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Recovered Sales</span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-semibold text-stone-900 dark:text-white">{recoveredSales.length}</h3>
            <span className="text-xs font-medium text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">Converted</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Recovery Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-semibold text-stone-900 dark:text-white">
              {sessions.length ? `${Math.round((recoveredSales.length / sessions.length) * 100)}%` : "0%"}
            </h3>
            <span className="text-xs font-medium text-stone-500">industry avg: ~15%</span>
          </div>
        </div>
      </div>

      {/* Lead session list */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-stone-900 dark:text-white">Active Leaking Carts</h3>

        <div className="grid grid-cols-1 gap-4">
          {activeLeads.map((session) => {
            const totalVal = getCartTotal(session.items);
            return (
              <div key={session.id} className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                
                {/* Contact and timing column */}
                <div className="space-y-3 xl:w-1/3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-stone-400" />
                    <span className="text-xs font-medium text-stone-500">
                      Abandoned {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {session.email && (
                      <div className="flex items-center gap-2.5 text-sm text-stone-900 dark:text-stone-300 font-medium">
                        <Mail size={16} className="text-stone-400" />
                        <span>{session.email}</span>
                      </div>
                    )}
                    {session.whatsapp_number && (
                      <div className="flex items-center gap-2.5 text-sm text-stone-900 dark:text-stone-300 font-medium">
                        <Phone size={16} className="text-stone-400" />
                        <span>{session.whatsapp_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items column */}
                <div className="flex-1 space-y-2">
                  <h4 className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                    <ShoppingBag size={12} />
                    <span>Cart Products</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {session.items.map((item, idx) => (
                      <span key={idx} className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-md text-sm font-medium text-stone-900 dark:text-stone-300">
                        {item.title} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Value & Reminder controls */}
                <div className="xl:w-1/4 flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 xl:border-l border-stone-200 dark:border-stone-800 xl:pl-6">
                  <div className="text-left xl:text-right">
                    <span className="text-xs font-medium text-stone-500 block mb-0.5">Cart Value</span>
                    <span className="text-lg font-semibold text-stone-900 dark:text-white">${totalVal.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2 w-full xl:w-auto">
                    {session.email && (
                      <button
                        onClick={() => triggerReminder(session.id, "email", session.email!)}
                        disabled={remindedCarts.includes(`${session.id}-email`)}
                        className={`flex-1 xl:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                          ${remindedCarts.includes(`${session.id}-email`)
                            ? "bg-stone-50 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700"
                            : "bg-white dark:bg-[#111] hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-900 dark:text-white border-stone-300 dark:border-stone-600 shadow-sm"
                          }
                        `}
                      >
                        <BellRing size={14} />
                        <span>{remindedCarts.includes(`${session.id}-email`) ? "Sent" : "Email"}</span>
                      </button>
                    )}

                    {session.whatsapp_number && (
                      <button
                        onClick={() => triggerReminder(session.id, "whatsapp", session.whatsapp_number!)}
                        disabled={remindedCarts.includes(`${session.id}-whatsapp`)}
                        className={`flex-1 xl:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                          ${remindedCarts.includes(`${session.id}-whatsapp`)
                            ? "bg-stone-50 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700"
                            : "bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-sm"
                          }
                        `}
                      >
                        <BellRing size={14} />
                        <span>{remindedCarts.includes(`${session.id}-whatsapp`) ? "Sent" : "WhatsApp"}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
          
          {activeLeads.length === 0 && (
            <div className="py-12 text-center text-stone-500 text-sm border border-stone-200 dark:border-stone-800 rounded-xl">
              No active abandoned carts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
