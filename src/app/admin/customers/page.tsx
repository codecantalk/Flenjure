"use client";

import React, { useEffect, useState, useMemo, Fragment } from "react";
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  CustomerData 
} from "../actions";
import { 
  Loader2,
  Mail,
  Phone,
  Clock,
  ShoppingBag,
  Users,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Tag,
  FileText,
  ShieldCheck,
  Sparkles,
  X,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface ShippingAddress {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  snapchat_handle?: string;
  whatsapp_number?: string;
}

interface Customer {
  id: string;
  auth_id?: string | null;
  first_name?: string;
  last_name?: string;
  name: string;
  email: string;
  phone: string;
  shipping_address?: ShippingAddress | null;
  notes?: string;
  tags?: string[];
  is_registered?: boolean;
  total_spent: number;
  orders_count: number;
  last_order_date: string;
  created_at?: string;
  recent_orders: any[];
}

interface CustomerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
  tags: string[];
}

const DEFAULT_FORM: CustomerFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  notes: "",
  tags: []
};

const SUGGESTED_TAGS = ["VIP", "Interior Designer", "Wholesale", "Loyal", "In-Store", "Stylist", "Press"];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "registered" | "guest" | "vip">("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(DEFAULT_FORM);
  const [newTagInput, setNewTagInput] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchCustomers = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getCustomers();
      if (data) {
        setCustomers(data as Customer[]);
      }
    } catch (err: any) {
      console.error("Error loading customers:", err);
      showNotification("error", "Failed to refresh customer directory.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Keyboard navigation for modal (Escape key to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleCopy = (text: string, id: string) => {
    if (!text || text === "Unknown") return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode("create");
    setEditingCustomerId(null);
    setFormData(DEFAULT_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalMode("edit");
    setEditingCustomerId(customer.id);
    setFormError(null);

    // Split name if first/last aren't explicitly saved
    let fName = customer.first_name || "";
    let lName = customer.last_name || "";
    if (!fName && !lName && customer.name && customer.name !== "Customer") {
      const parts = customer.name.trim().split(" ");
      fName = parts[0] || "";
      lName = parts.slice(1).join(" ") || "";
    }

    const addr = customer.shipping_address || {};

    setFormData({
      first_name: fName,
      last_name: lName,
      email: customer.email && customer.email !== "Unknown" ? customer.email : "",
      phone: customer.phone && customer.phone !== "Unknown" ? customer.phone : "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "United States",
      notes: customer.notes || "",
      tags: customer.tags ? [...customer.tags] : []
    });

    setIsModalOpen(true);
  };

  // Tag management
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!formData.tags.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  // Submit Modal
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed || !emailTrimmed.includes("@")) {
      setFormError("A valid email address is required.");
      setFormSubmitting(false);
      return;
    }

    const payload: CustomerData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: emailTrimmed,
      phone: formData.phone.trim(),
      shipping_address: {
        fullName: `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim() || undefined,
        addressLine1: formData.addressLine1.trim() || undefined,
        addressLine2: formData.addressLine2.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        country: formData.country.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        whatsapp_number: formData.phone.trim() || undefined,
      },
      notes: formData.notes.trim(),
      tags: formData.tags
    };

    try {
      if (modalMode === "create") {
        const res = await createCustomer(payload);
        if (res.error) {
          setFormError(res.error);
          setFormSubmitting(false);
          return;
        }
        showNotification("success", `Customer "${payload.first_name || payload.email}" created successfully.`);
      } else {
        const idToUpdate = editingCustomerId || payload.email;
        const res = await updateCustomer(idToUpdate, payload);
        if (res.error) {
          setFormError(res.error);
          setFormSubmitting(false);
          return;
        }
        showNotification("success", `Customer profile updated successfully.`);
      }

      setIsModalOpen(false);
      await fetchCustomers(true);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Customer
  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    const target = customerToDelete;
    setCustomerToDelete(null);

    try {
      const res = await deleteCustomer(target.id || target.email);
      if (res.error) {
        showNotification("error", `Could not delete customer: ${res.error}`);
        return;
      }
      showNotification("success", `Customer profile removed.`);
      await fetchCustomers(true);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to remove customer.");
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const registeredCount = customers.filter(c => c.is_registered).length;
    const totalSpend = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const vipCount = customers.filter(c => (c.total_spent || 0) >= 500 || c.tags?.includes("VIP")).length;

    return {
      totalCustomers,
      registeredCount,
      totalSpend,
      vipCount
    };
  }, [customers]);

  // Filtering & Search
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Filter tab
      if (activeFilter === "registered" && !customer.is_registered) return false;
      if (activeFilter === "guest" && customer.is_registered) return false;
      if (activeFilter === "vip" && (customer.total_spent < 500 && !customer.tags?.includes("VIP"))) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const nameMatch = customer.name?.toLowerCase().includes(q);
      const emailMatch = customer.email?.toLowerCase().includes(q);
      const phoneMatch = customer.phone?.toLowerCase().includes(q);
      const cityMatch = customer.shipping_address?.city?.toLowerCase().includes(q);
      const notesMatch = customer.notes?.toLowerCase().includes(q);
      const tagMatch = customer.tags?.some(t => t.toLowerCase().includes(q));

      return nameMatch || emailMatch || phoneMatch || cityMatch || notesMatch || tagMatch;
    });
  }, [customers, activeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center gap-3">
        <Loader2 className="animate-spin text-stone-400" size={32} />
        <span className="text-sm font-medium text-stone-500">Loading client registry...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-md transition-all ${
            notification.type === "success" 
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200" 
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-2.5">
              {notification.type === "success" ? <Check size={18} /> : <X size={18} />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-medium tracking-tight text-stone-900 dark:text-white">
                  Customer Directory
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Manage client profiles, shipping destinations, VIP statuses, and order histories
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => fetchCustomers(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors shadow-xs cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>

            <button
              onClick={openCreateModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors shadow-sm cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Total Clients</span>
              <Users size={16} className="text-stone-400" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 dark:text-white">
              {stats.totalCustomers}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Active directory records
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Registered Accounts</span>
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 dark:text-white">
              {stats.registeredCount}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Supabase Auth members
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Lifetime Spend</span>
              <DollarSign size={16} className="text-stone-400" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 dark:text-white">
              ${stats.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Cumulative store volume
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">VIP Clients</span>
              <Sparkles size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 dark:text-white">
              {stats.vipCount}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              $500+ spend or VIP tag
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/10">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setActiveFilter("registered")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === "registered"
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                Registered ({stats.registeredCount})
              </button>
              <button
                onClick={() => setActiveFilter("guest")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === "guest"
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                Guest Orders ({customers.length - stats.registeredCount})
              </button>
              <button
                onClick={() => setActiveFilter("vip")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === "vip"
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                VIPs ({stats.vipCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name, email, city, tag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#151515] border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/30 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5 whitespace-nowrap">Customer Profile</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Contact</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Location</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Orders</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Total Spend</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tags</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-sm">
                {filteredCustomers.map(customer => {
                  const isExpanded = expandedCustomer === customer.id;
                  const initials = (customer.name || customer.email || "C")
                    .split(" ")
                    .map(p => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const isVip = (customer.total_spent || 0) >= 500 || customer.tags?.includes("VIP");

                  return (
                    <Fragment key={customer.id}>
                      <tr 
                        onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}
                        className={`hover:bg-stone-50/80 dark:hover:bg-stone-900/40 transition-colors cursor-pointer ${
                          isExpanded ? "bg-stone-50/60 dark:bg-stone-900/30" : ""
                        }`}
                      >
                        {/* Profile Info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 shadow-2xs ${
                              isVip 
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                            }`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-stone-900 dark:text-white truncate">
                                  {customer.name}
                                </span>
                                {customer.is_registered ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                                    <ShieldCheck size={10} /> Member
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800/80 text-stone-500 whitespace-nowrap">
                                    Guest
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-stone-400 dark:text-stone-500 whitespace-nowrap">
                                Client since {new Date(customer.created_at || customer.last_order_date || Date.now()).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 group">
                              <Mail size={12} className="text-stone-400 shrink-0" />
                              <span className="truncate max-w-[180px]" title={customer.email}>
                                {customer.email}
                              </span>
                              {customer.email && customer.email !== "Unknown" && (
                                <button
                                  onClick={() => handleCopy(customer.email, `email-${customer.id}`)}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-opacity p-0.5 cursor-pointer"
                                  title="Copy Email"
                                >
                                  {copiedId === `email-${customer.id}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                </button>
                              )}
                            </div>
                            {customer.phone && customer.phone !== "Unknown" && (
                              <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 group">
                                <Phone size={12} className="text-stone-400 shrink-0" />
                                <span className="whitespace-nowrap">{customer.phone}</span>
                                <button
                                  onClick={() => handleCopy(customer.phone, `phone-${customer.id}`)}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-opacity p-0.5 cursor-pointer"
                                  title="Copy Phone"
                                >
                                  {copiedId === `phone-${customer.id}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 text-xs text-stone-600 dark:text-stone-400">
                          {customer.shipping_address?.city ? (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <MapPin size={12} className="text-stone-400 shrink-0" />
                              <span>{customer.shipping_address.city}, {customer.shipping_address.country || "USA"}</span>
                            </div>
                          ) : (
                            <span className="text-stone-400 dark:text-stone-600 italic whitespace-nowrap">Not specified</span>
                          )}
                        </td>

                        {/* Orders count */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                            <ShoppingBag size={12} /> {customer.orders_count} {customer.orders_count === 1 ? "order" : "orders"}
                          </span>
                        </td>

                        {/* Spend */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-semibold text-stone-900 dark:text-white">
                            ${(customer.total_spent || 0).toFixed(2)}
                          </div>
                          {customer.orders_count > 0 && (
                            <div className="text-[11px] text-stone-400">
                              Avg: ${((customer.total_spent || 0) / customer.orders_count).toFixed(2)}
                            </div>
                          )}
                        </td>

                        {/* Tags */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {customer.tags && customer.tags.length > 0 ? (
                              customer.tags.map((t, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 whitespace-nowrap"
                                >
                                  {t}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-stone-400 dark:text-stone-600">—</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => openEditModal(customer, e)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                              title="Edit Profile"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={() => setCustomerToDelete(customer)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Delete Profile"
                            >
                              <Trash2 size={15} />
                            </button>

                            <button
                              onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Customer Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-stone-50/70 dark:bg-stone-900/25 border-b border-stone-200 dark:border-stone-800">
                          <td colSpan={7} className="p-0 whitespace-normal">
                            <div className="p-5 sm:p-7 md:p-8 space-y-6">
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                                
                                {/* 1. Shipping Destination Card */}
                                <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-stone-100 dark:border-stone-800">
                                      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-stone-500 tracking-wider">
                                        <MapPin size={14} /> Shipping Destination
                                      </div>
                                      <button
                                        onClick={(e) => openEditModal(customer, e)}
                                        className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                      >
                                        <Edit2 size={12} /> Edit
                                      </button>
                                    </div>

                                    {customer.shipping_address && (customer.shipping_address.addressLine1 || customer.shipping_address.city) ? (
                                      <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 break-words leading-relaxed">
                                        {customer.shipping_address.fullName && (
                                          <div className="font-semibold text-stone-900 dark:text-white">
                                            {customer.shipping_address.fullName}
                                          </div>
                                        )}
                                        {customer.shipping_address.addressLine1 && (
                                          <div>{customer.shipping_address.addressLine1}</div>
                                        )}
                                        {customer.shipping_address.addressLine2 && (
                                          <div>{customer.shipping_address.addressLine2}</div>
                                        )}
                                        <div>
                                          {[
                                            customer.shipping_address.city,
                                            customer.shipping_address.state,
                                            customer.shipping_address.postalCode
                                          ].filter(Boolean).join(", ")}
                                        </div>
                                        <div>{customer.shipping_address.country || "United States"}</div>
                                        {customer.shipping_address.phone && (
                                          <div className="pt-2 text-stone-500">
                                            Phone: {customer.shipping_address.phone}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="py-4 px-3 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 text-center flex flex-col items-center justify-center gap-2">
                                        <MapPin size={18} className="text-stone-400" />
                                        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-[220px] mx-auto leading-relaxed break-words">
                                          No shipping address registered yet.
                                        </p>
                                        <button
                                          type="button"
                                          onClick={(e) => openEditModal(customer, e)}
                                          className="text-xs font-medium text-stone-900 dark:text-white underline underline-offset-4 hover:opacity-75 transition-opacity cursor-pointer"
                                        >
                                          + Add Shipping Address
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 2. Staff Notes and Tags */}
                                <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-stone-100 dark:border-stone-800">
                                      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-stone-500 tracking-wider">
                                        <FileText size={14} /> Staff Notes & Tags
                                      </div>
                                      <button
                                        onClick={(e) => openEditModal(customer, e)}
                                        className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                      >
                                        <Edit2 size={12} /> Edit
                                      </button>
                                    </div>

                                    <div className="space-y-3.5">
                                      <div>
                                        <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1">
                                          Internal Notes
                                        </div>
                                        <div className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/60 p-3 rounded-lg min-h-[55px] border border-stone-100 dark:border-stone-800 break-words whitespace-pre-wrap leading-relaxed">
                                          {customer.notes ? (
                                            customer.notes
                                          ) : (
                                            <div className="text-stone-400 italic flex items-center justify-between">
                                              <span>No staff notes recorded.</span>
                                              <button
                                                type="button"
                                                onClick={(e) => openEditModal(customer, e)}
                                                className="text-stone-600 dark:text-stone-300 underline not-italic hover:text-stone-900 dark:hover:text-white cursor-pointer"
                                              >
                                                + Add
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div>
                                        <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">
                                          Customer Tags
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {customer.tags && customer.tags.length > 0 ? (
                                            customer.tags.map((tg, i) => (
                                              <span 
                                                key={i} 
                                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1"
                                              >
                                                <Tag size={10} /> {tg}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-xs text-stone-400 italic">No assigned tags.</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Client Summary Card */}
                                <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="text-xs font-semibold uppercase text-stone-500 tracking-wider mb-3 pb-2.5 border-b border-stone-100 dark:border-stone-800">
                                      Client Summary
                                    </div>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/40">
                                        <span className="text-stone-400">Account Type</span>
                                        <span className="font-medium text-stone-900 dark:text-white">
                                          {customer.is_registered ? "Registered Member" : "Guest Customer"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/40">
                                        <span className="text-stone-400">Orders Completed</span>
                                        <span className="font-medium text-stone-900 dark:text-white">
                                          {customer.orders_count}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800/40">
                                        <span className="text-stone-400">Lifetime Revenue</span>
                                        <span className="font-medium text-stone-900 dark:text-white">
                                          ${(customer.total_spent || 0).toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-400">Last Order Placed</span>
                                        <span className="font-medium text-stone-900 dark:text-white">
                                          {new Date(customer.last_order_date).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-4 flex gap-2">
                                    <button
                                      onClick={(e) => openEditModal(customer, e)}
                                      className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors text-center cursor-pointer"
                                    >
                                      Edit Full Profile
                                    </button>
                                    <a
                                      href={`mailto:${customer.email}`}
                                      className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                                      title="Send Email"
                                    >
                                      <Mail size={14} />
                                    </a>
                                  </div>
                                </div>

                              </div>

                              {/* Order History */}
                              <div>
                                <h4 className="text-sm font-serif font-medium text-stone-900 dark:text-white mb-3 flex items-center gap-2">
                                  <ShoppingBag size={16} /> Purchase & Order History ({customer.recent_orders?.length || 0})
                                </h4>

                                {customer.recent_orders && customer.recent_orders.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {customer.recent_orders.map((order: any, idx: number) => (
                                      <div 
                                        key={order.id || idx} 
                                        className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-4 flex flex-col justify-between shadow-2xs min-w-0"
                                      >
                                        <div>
                                          <div className="flex justify-between items-start mb-3">
                                            <div>
                                              <div className="text-xs font-semibold text-stone-900 dark:text-white font-mono">
                                                #{order.id?.slice(0, 8)}
                                              </div>
                                              <div className="text-[11px] text-stone-400">
                                                {new Date(order.created_at).toLocaleString(undefined, { 
                                                  dateStyle: "medium", 
                                                  timeStyle: "short" 
                                                })}
                                              </div>
                                            </div>
                                            <div className="text-xs font-semibold text-stone-900 dark:text-white">
                                              ${Number(order.total_amount || 0).toFixed(2)}
                                            </div>
                                          </div>

                                          <div className="space-y-1.5 mb-3">
                                            {order.items?.map((item: any, itemIdx: number) => (
                                              <div key={itemIdx} className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
                                                <span className="truncate pr-2">
                                                  {item.quantity}x {item.title || item.name} {item.size && item.size !== 'OS' ? `(${item.size})` : ''}
                                                </span>
                                                <span className="shrink-0 text-stone-500 font-mono">
                                                  ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
                                          <span className="text-stone-400 capitalize truncate pr-2">
                                            {order.payment_method?.replace(/_/g, " ") || "Payment"}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full font-medium uppercase text-[10px] tracking-wider shrink-0 ${
                                            order.status === "shipped" 
                                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                              : order.status === "cancelled"
                                              ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                                          }`}>
                                            {order.status || "Pending"}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-6 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-[#111]">
                                    <p className="text-xs text-stone-400">No purchase records registered yet for this client.</p>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <Users size={32} className="mx-auto text-stone-300 dark:text-stone-700" />
                        <h3 className="text-sm font-medium text-stone-900 dark:text-white">
                          No matching customers found
                        </h3>
                        <p className="text-xs text-stone-500">
                          {searchQuery 
                            ? `No records found matching "${searchQuery}". Try adjusting your keywords.` 
                            : "Your customer directory is empty. Create a profile manually or wait for clients to place orders."}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-xs font-medium text-stone-900 dark:text-white underline underline-offset-4 cursor-pointer"
                          >
                            Clear search filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* CREATE / EDIT CUSTOMER MODAL (STICKY HEADER, STICKY FOOTER, SMOOTH SCROLL BODY) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center p-4 sm:p-6 overflow-y-auto overscroll-contain"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col my-auto max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Sticky Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 shrink-0">
                  {modalMode === "create" ? <UserPlus size={18} /> : <Edit2 size={18} />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-medium text-stone-900 dark:text-white">
                    {modalMode === "create" ? "Add New Customer Profile" : "Edit Customer Profile"}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500">
                    {modalMode === "create" 
                      ? "Create an administrative client profile in Flenjure CMS"
                      : "Modify contact info, shipping coordinates, tags, and internal notes"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form with Scrollable Content and Sticky Action Footer */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 overscroll-contain">
                
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium">
                    {formError}
                  </div>
                )}

                {/* Section 1: Contact & Personal Details */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 pb-1 border-b border-stone-100 dark:border-stone-800/60">
                    <Users size={13} /> 1. Personal & Contact Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alexander"
                        value={formData.first_name}
                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Laurent"
                        value={formData.last_name}
                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="client@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (404) 555-0192"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Shipping Destination */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 pb-1 border-b border-stone-100 dark:border-stone-800/60">
                    <MapPin size={13} /> 2. Primary Shipping Destination
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Street Address (Line 1)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3344 Peachtree Rd NE"
                      value={formData.addressLine1}
                      onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Apartment, Suite, Unit (Line 2)
                    </label>
                    <input
                      type="text"
                      placeholder="Suite 1800 (Optional)"
                      value={formData.addressLine2}
                      onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="Atlanta"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        State / Province
                      </label>
                      <input
                        type="text"
                        placeholder="GA"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        Postal / ZIP
                      </label>
                      <input
                        type="text"
                        placeholder="30326"
                        value={formData.postalCode}
                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        placeholder="United States"
                        value={formData.country}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: CRM Details, Notes & Tags */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 pb-1 border-b border-stone-100 dark:border-stone-800/60">
                    <Tag size={13} /> 3. Internal Notes & Tags
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Internal Staff Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Private staff notes, preferences, sizing feedback, interior styling notes..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-600 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Customer Tags
                    </label>
                    
                    {/* Current Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px] p-2 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800">
                      {formData.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-2xs"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:opacity-70 transition-opacity p-0.5 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {formData.tags.length === 0 && (
                        <span className="text-xs text-stone-400 italic py-0.5">No tags assigned yet</span>
                      )}
                    </div>

                    {/* Add Custom Tag */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Type a tag name and hit Enter..."
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag(newTagInput);
                          }
                        }}
                        className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(newTagInput)}
                        className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                      >
                        Add Tag
                      </button>
                    </div>

                    {/* Quick Suggested Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-400">
                      <span className="font-medium mr-1">Suggestions:</span>
                      {SUGGESTED_TAGS.map(sug => {
                        const isAdded = formData.tags.includes(sug);
                        return (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => !isAdded && handleAddTag(sug)}
                            disabled={isAdded}
                            className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                              isAdded
                                ? "border-transparent bg-stone-200/60 dark:bg-stone-800 text-stone-400 cursor-default"
                                : "border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900"
                            }`}
                          >
                            + {sug}
                          </button>
                        );
                      })}
                    </div>

                  </div>

                </div>

              </div>

              {/* Sticky Modal Action Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs sm:text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{modalMode === "create" ? "Create Customer Profile" : "Save Changes"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        title="Remove Customer Profile"
        message={`Are you sure you want to remove the profile for "${customerToDelete?.name || customerToDelete?.email}"? This will detach the customer's auth records.`}
        confirmText="Remove Customer"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCustomerToDelete(null)}
      />

    </div>
  );
}
