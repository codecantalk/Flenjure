"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  FolderOpen,
  Image as ImageIcon
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  order: number;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState(0);

  const mockCollections: Collection[] = [
    {
      id: "col-1",
      name: "Spring / Summer 2026",
      slug: "spring-summer-2026",
      description: "Editorial high-end seasonal apparel drop featuring custom knits and tailoring.",
      image_url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800",
      order: 1
    },
    {
      id: "col-2",
      name: "Uniform",
      slug: "uniform",
      description: "Timeless everyday essentials designed for life and comfort.",
      image_url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
      order: 2
    },
    {
      id: "col-3",
      name: "Flenjure / Objects",
      slug: "flenjure-objects",
      description: "Curated objects, accessories, and snacks.",
      image_url: "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=800",
      order: 3
    }
  ];

  useEffect(() => {
    async function fetchCollections() {
      const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) {
        setCollections(mockCollections);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.from("collections").select("*").order("order", { ascending: true });
        if (data && data.length > 0) {
          setCollections(data as Collection[]);
        } else {
          setCollections(mockCollections);
        }
      } catch (err) {
        console.error("Error loading collections:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName(""); setDescription(""); setImageUrl(""); setOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setName(collection.name); setDescription(collection.description || "");
    setImageUrl(collection.image_url || ""); setOrder(collection.order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      setCollections(collections.filter(c => c.id !== id));
      return;
    }

    try {
      await supabase.from("collections").delete().eq("id", id);
      setCollections(collections.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newCol: Omit<Collection, "id" | "slug"> = {
      name, description, image_url: imageUrl || "", order
    };

    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      if (editingCollection) {
        setCollections(collections.map(c => c.id === editingCollection.id ? { ...c, ...newCol, slug } : c));
      } else {
        setCollections([...collections, { ...newCol, id: Math.random().toString(), slug }]);
      }
      setIsModalOpen(false);
      return;
    }

    try {
      if (editingCollection) {
        await supabase.from("collections").update({ ...newCol, slug }).eq("id", editingCollection.id);
      } else {
        await supabase.from("collections").insert([{ ...newCol, slug }]);
      }
      const { data } = await supabase.from("collections").select("*").order("order", { ascending: true });
      if (data) setCollections(data as Collection[]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save collection failed:", err);
      alert("Failed to save.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-stone-500">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
        <span className="text-[10px] uppercase tracking-widest font-mono">Syncing Collections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 selection:bg-amber-500 selection:text-black">
      {/* Top Action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-stone-850">
        <div>
          <h2 className="text-3xl font-serif font-light text-white tracking-wide">Collections</h2>
          <p className="text-[11px] text-stone-500 uppercase tracking-widest mt-2 font-mono">Manage Storefront Categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-5 py-2.5 rounded-lg font-medium text-xs uppercase tracking-wider transition-all duration-300"
        >
          <Plus size={16} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-stone-900/20 border border-stone-850 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300 border-collapse">
            <thead>
              <tr className="bg-stone-900/50 border-b border-stone-850">
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Collection</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Description</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium text-center">Sort Order</th>
                <th className="py-4 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850/50">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-stone-850/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-md bg-stone-950 border border-stone-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {col.image_url ? (
                          <img src={col.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FolderOpen size={20} className="text-stone-700" />
                        )}
                      </div>
                      <div>
                        <button onClick={() => openEditModal(col)} className="font-medium text-stone-200 hover:text-amber-500 transition-colors text-sm">
                          {col.name}
                        </button>
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5">/{col.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-light text-stone-400 max-w-xs truncate">
                    {col.description || "No description provided"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-stone-900 px-2 py-1 rounded text-[10px] text-stone-400 border border-stone-800 font-mono">
                      {col.order}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(col)} className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(col.id)} className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-850 bg-stone-950/50">
              <h3 className="text-xl font-serif font-light text-white">
                {editingCollection ? "Edit Collection" : "New Collection"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-500 hover:text-white rounded-full hover:bg-stone-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">Collection Name *</label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-light text-sm text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">Short Description</label>
                  <textarea
                    rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-light text-sm text-white resize-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">Rendering Sort Order (Lower = First)</label>
                  <input
                    type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-mono text-sm text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">Cover Image URL</label>
                  <input
                    type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-mono text-sm text-white transition-colors"
                  />
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-stone-850 bg-stone-950 flex gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                <Check size={14} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
