"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Loader2,
  CheckCircle,
  Clock,
  Send,
  Eye,
  X,
  CreditCard,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  shipping_address: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  whatsapp_number?: string;
  email?: string;
  payment_details?: {
    receiptImage?: string;
    cashappTag?: string;
    zelleName?: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const mockOrders: Order[] = [
    {
      id: "FL-1002",
      created_at: new Date().toISOString(),
      status: "pending",
      total_amount: 70.00,
      payment_method: "manual_payment",
      payment_status: "pending",
      shipping_address: {
        fullName: "Flenjure Papi",
        addressLine1: "123 Peachtree St NE",
        city: "Atlanta",
        state: "GA",
        postalCode: "30303",
        country: "USA"
      },
      items: [
        { product_id: "prod-1", title: "Fleñjure OG Jersey", quantity: 1, price: 60.00 },
        { product_id: "prod-2", title: "Fleñjure Bag Packs", quantity: 2, price: 5.00 }
      ],
      whatsapp_number: "+14041234567",
      email: "client@flenjure.com",
      payment_details: {
        cashappTag: "$Flenjure"
      }
    },
    {
      id: "FL-1001",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: "paid",
      total_amount: 120.00,
      payment_method: "apple_pay",
      payment_status: "completed",
      shipping_address: {
        fullName: "James Trend",
        addressLine1: "45 Fashion Way",
        city: "London",
        state: "Greater London",
        postalCode: "W1A 1AA",
        country: "UK"
      },
      items: [
        { product_id: "prod-1", title: "Fleñjure OG Jersey", quantity: 2, price: 60.00 }
      ],
      whatsapp_number: "+447712345678",
      email: "james@example.com"
    }
  ];

  useEffect(() => {
    async function fetchOrders() {
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) {
        setOrders(mockOrders);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setOrders(data as Order[]);
        } else {
          setOrders(mockOrders);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string, field: "status" | "payment_status") => {
    const isMissingEnv = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    const updatedOrders = orders.map(order => {
      if (order.id === id) {
        const updated = { ...order, [field]: newStatus };
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(updated);
        }
        return updated;
      }
      return order;
    });

    setOrders(updatedOrders);

    if (isMissingEnv) return;

    try {
      await supabase
        .from("orders")
        .update({ [field]: newStatus })
        .eq("id", id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
        <span className="text-xs uppercase tracking-widest">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 selection:bg-amber-500 selection:text-black">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-stone-850">
        <div>
          <h2 className="text-3xl font-serif font-light text-white tracking-wide">Orders</h2>
          <p className="text-[11px] text-stone-500 uppercase tracking-widest mt-2 font-mono">
            {orders.length} Total Transactions
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="px-4 py-2.5 rounded-lg border border-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors hidden sm:block">
            Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table Grid */}
      <div className="bg-stone-900/20 border border-stone-850 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300 border-collapse">
            <thead>
              <tr className="bg-stone-900/50 border-b border-stone-850">
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Order ID</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Customer</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Method</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Total Amount</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Payment</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Fulfillment</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-850/30 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="py-4 px-6 font-mono font-medium text-amber-500 hover:text-amber-400 transition-colors">{order.id}</td>
                  <td className="py-4 px-4">
                    <div className="text-white font-medium text-sm">{order.shipping_address?.fullName || "Guest Customer"}</div>
                    <div className="text-[10px] font-mono text-stone-500 mt-0.5">{order.email}</div>
                  </td>
                  <td className="py-4 px-4 uppercase tracking-wider text-[10px] font-mono text-stone-400">
                    {order.payment_method === "manual_payment" ? "Manual Transfer" : "Apple Pay"}
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-white">${order.total_amount.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border
                      ${order.payment_status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}
                    `}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border
                      ${order.status === "shipped" && "bg-blue-500/10 text-blue-400 border-blue-500/20"}
                      ${order.status === "pending" && "bg-amber-500/10 text-amber-500 border-amber-500/20"}
                      ${order.status === "paid" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}
                      ${order.status === "cancelled" && "bg-red-500/10 text-red-400 border-red-500/20"}
                    `}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Side-Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg bg-stone-900 border-l border-stone-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header info */}
            <div>
              <div className="p-6 border-b border-stone-850 flex justify-between items-center bg-stone-950/20">
                <div>
                  <span className="font-mono text-xs text-stone-500 uppercase tracking-widest leading-none">Order Invoice</span>
                  <h3 className="text-xl font-serif font-light text-white mt-1">{selectedOrder.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-stone-500 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Order content */}
              <div className="p-6 space-y-6">
                {/* Status Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-mono mb-2">Order State</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value, "status")}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs font-light text-white outline-none focus:border-amber-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-mono mb-2">Payment Status</label>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value, "payment_status")}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs font-light text-white outline-none focus:border-amber-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                {/* Items purchase listing */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">Cart Items</h4>
                  <div className="bg-stone-950 border border-stone-850/60 rounded-xl p-4 divide-y divide-stone-850/40">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-xs font-medium text-white">{item.title}</p>
                          <p className="text-[10px] text-stone-500">Qty: {item.quantity} • ${item.price.toFixed(2)} ea</p>
                        </div>
                        <span className="text-xs text-white font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-850/40">
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-stone-400 font-mono flex items-center gap-1.5">
                      <MapPin size={12} className="text-stone-500" />
                      <span>Shipping Address</span>
                    </h4>
                    <p className="text-xs text-stone-300 font-light leading-relaxed">
                      {selectedOrder.shipping_address?.fullName} <br />
                      {selectedOrder.shipping_address?.addressLine1} <br />
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postalCode} <br />
                      {selectedOrder.shipping_address?.country}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-stone-400 font-mono flex items-center gap-1.5">
                      <CreditCard size={12} className="text-stone-500" />
                      <span>CRM Details</span>
                    </h4>
                    <div className="space-y-2 text-xs text-stone-300 font-light">
                      {selectedOrder.whatsapp_number && (
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-stone-500" />
                          <span>{selectedOrder.whatsapp_number}</span>
                        </div>
                      )}
                      {selectedOrder.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-stone-500" />
                          <span className="truncate block max-w-[160px]">{selectedOrder.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transfer Info */}
                {selectedOrder.payment_method === "manual_payment" && selectedOrder.payment_details && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-amber-500 font-mono">Manual Payment Reference</h4>
                    <div className="text-xs text-stone-300">
                      {selectedOrder.payment_details.cashappTag && (
                        <p>CashApp Tag: <span className="font-semibold text-amber-500/80">{selectedOrder.payment_details.cashappTag}</span></p>
                      )}
                      {selectedOrder.payment_details.zelleName && (
                        <p>Zelle Account: <span className="font-semibold text-amber-500/80">{selectedOrder.payment_details.zelleName}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="p-6 border-t border-stone-850 bg-stone-950/20 flex gap-4">
              <button
                onClick={() => updateStatus(selectedOrder.id, "shipped", "status")}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                <Send size={14} />
                <span>Dispatch / Ship</span>
              </button>
              <button
                onClick={() => updateStatus(selectedOrder.id, "completed", "payment_status")}
                className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-750 text-stone-200 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                <CheckCircle size={14} />
                <span>Confirm Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
