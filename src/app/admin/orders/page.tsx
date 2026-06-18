"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderField } from "../actions";
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
  MapPin,
  Search,
  Filter,
  Image as ImageIcon
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
  const [filter, setFilter] = useState<"All" | "Unfulfilled" | "Unpaid">("All");

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
        const data = await getOrders();
        setOrders(data as Order[]);
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

    try {
      await updateOrderField(id, field, newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }
    
    const headers = ["Order ID", "Date", "Customer Name", "Email", "Total Amount", "Payment Status", "Status"];
    const rows = orders.map(o => [
      `ORD-${o.id.substring(0, 8).toUpperCase()}`,
      new Date(o.created_at).toLocaleDateString(),
      `"${(o.shipping_address?.fullName || "Guest").replace(/"/g, '""')}"`,
      o.email || o.whatsapp_number || "N/A",
      o.total_amount,
      o.payment_status,
      o.status
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `flenjure-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "All") return true;
    if (filter === "Unfulfilled") return order.status !== "shipped";
    if (filter === "Unpaid") return order.payment_status !== "completed";
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-stone-500">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Orders</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="px-3 py-1.5 text-sm font-medium border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111] text-stone-900 dark:text-white rounded-md shadow-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors hidden sm:block"
          >
            Export
          </button>
        </div>
      </div>

      {/* Toolbar & Filters (Shopify Card style) */}
      <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4 px-3">
            <button onClick={() => setFilter("All")} className={`text-sm font-medium pb-1.5 border-b-2 transition-colors ${filter === "All" ? "text-stone-900 dark:text-white border-stone-900 dark:border-white" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border-transparent"}`}>All</button>
            <button onClick={() => setFilter("Unfulfilled")} className={`text-sm font-medium pb-1.5 border-b-2 transition-colors ${filter === "Unfulfilled" ? "text-stone-900 dark:text-white border-stone-900 dark:border-white" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border-transparent"}`}>Unfulfilled</button>
            <button onClick={() => setFilter("Unpaid")} className={`text-sm font-medium pb-1.5 border-b-2 transition-colors ${filter === "Unpaid" ? "text-stone-900 dark:text-white border-stone-900 dark:border-white" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border-transparent"}`}>Unpaid</button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input 
                type="text" 
                placeholder="Search orders"
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md pl-8 pr-3 py-1.5 text-sm outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
              />
            </div>
            <button className="p-1.5 rounded-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 font-medium border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Delivery</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Fulfillment</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-900 dark:text-stone-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-stone-500">No orders found.</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="px-5 py-4 font-semibold hover:underline">
                    {order.id}
                  </td>
                  <td className="px-5 py-4 text-xs text-stone-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    {order.shipping_address?.fullName || "Guest Customer"}
                  </td>
                  <td className="px-5 py-4 text-xs text-stone-500">
                    {order.shipping_address?.city ? `${order.shipping_address.city}, ${order.shipping_address.state}` : "Digital / N/A"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border
                      ${order.payment_status === "completed" ? "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700" : "bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700"}
                    `}>
                      {order.payment_status === "completed" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border
                      ${order.status === "shipped" && "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700"}
                      ${order.status === "pending" && "bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700"}
                      ${order.status === "paid" && "bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700"}
                      ${order.status === "cancelled" && "bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700"}
                    `}>
                      {order.status === "shipped" ? "Fulfilled" : "Unfulfilled"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium">
                    ${order.total_amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal (Shopify Style Full Screen/Wide Modal) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfcfc] dark:bg-[#0a0a0a] w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111]">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors">
                  <X size={18} />
                </button>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                  Order {selectedOrder.id}
                </h3>
                <span className="text-xs text-stone-500 font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(selectedOrder.id, "cancelled", "status")} className="px-3 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                  Cancel order
                </button>
              </div>
            </div>

            {/* Modal Body (Two Column Layout) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 md:space-y-0 md:flex md:gap-6 custom-scrollbar">
              
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                
                {/* Fulfillment Status Card */}
                <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedOrder.status === 'shipped' ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-400'}`}></span>
                      {selectedOrder.status === "shipped" ? "Fulfilled" : "Unfulfilled"}
                    </h4>
                    {selectedOrder.status !== "shipped" && (
                      <button onClick={() => updateStatus(selectedOrder.id, "shipped", "status")} className="text-xs font-medium text-stone-900 dark:text-white underline hover:no-underline">
                        Mark as fulfilled
                      </button>
                    )}
                  </div>
                  
                  <div className="border border-stone-200 dark:border-stone-800 rounded-lg divide-y divide-stone-200 dark:divide-stone-800">
                    {(() => {
                      let parsedItems = [];
                      try {
                        parsedItems = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items;
                        if (!Array.isArray(parsedItems)) parsedItems = [];
                      } catch (e) {}
                      
                      return parsedItems.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/30">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded flex items-center justify-center border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={14} className="text-stone-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-stone-900 dark:text-white">{item.title}</p>
                              <p className="text-xs text-stone-500">${Number(item.price || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-stone-900 dark:text-white font-medium">x {item.quantity}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Payment Status Card */}
                <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedOrder.payment_status === 'completed' ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-400'}`}></span>
                      {selectedOrder.payment_status === "completed" ? "Paid" : "Pending payment"}
                    </h4>
                    {selectedOrder.payment_status !== "completed" && (
                      <button onClick={() => updateStatus(selectedOrder.id, "completed", "payment_status")} className="text-xs font-medium text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                        Mark as paid
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600 dark:text-stone-400">Subtotal</span>
                      <span className="text-stone-900 dark:text-white">${selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-stone-900 dark:text-white">Total</span>
                      <span className="text-stone-900 dark:text-white">${selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-stone-500 text-right pt-1">
                      Paid by {selectedOrder.payment_method === "manual_payment" ? "Manual Transfer" : "Apple Pay"}
                    </div>
                  </div>

                  {selectedOrder.payment_method === "manual_payment" && selectedOrder.payment_details && (
                    <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-1">
                      <h5 className="text-xs font-medium text-stone-900 dark:text-white">Manual Payment Details</h5>
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        {selectedOrder.payment_details.cashappTag && (
                          <p>CashApp: <span className="font-semibold text-stone-900 dark:text-white">{selectedOrder.payment_details.cashappTag}</span></p>
                        )}
                        {selectedOrder.payment_details.zelleName && (
                          <p>Zelle: <span className="font-semibold text-stone-900 dark:text-white">{selectedOrder.payment_details.zelleName}</span></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column */}
              <div className="md:w-72 space-y-6 shrink-0">
                {/* Customer Details Card */}
                <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Customer</h4>
                  
                  <div className="space-y-3">
                    {selectedOrder.email ? (
                      <div className="flex items-start gap-2">
                        <Mail size={14} className="text-stone-400 mt-0.5" />
                        <a href={`mailto:${selectedOrder.email}`} className="text-sm text-stone-600 dark:text-stone-300 hover:underline break-all">
                          {selectedOrder.email}
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm text-stone-500">No email provided</span>
                    )}

                    {selectedOrder.whatsapp_number && (
                      <div className="flex items-start gap-2">
                        <Phone size={14} className="text-stone-400 mt-0.5" />
                        <span className="text-sm text-stone-600 dark:text-stone-300">
                          {selectedOrder.whatsapp_number}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                    <h5 className="text-xs font-medium text-stone-900 dark:text-white">Shipping Address</h5>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {selectedOrder.shipping_address?.fullName} <br />
                      {selectedOrder.shipping_address?.addressLine1} <br />
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postalCode} <br />
                      {selectedOrder.shipping_address?.country}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
