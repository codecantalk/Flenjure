"use client";

import { useEffect, useState } from "react";
import { getCafeItems, createCafeItem, updateCafeItem, deleteCafeItem, uploadProductImage } from "../actions";
import { Plus, Trash2, Loader2, Coffee, Upload, X } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import Image from "next/image";

interface CafeItem {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

export default function AdminCafePage() {
  const [items, setItems] = useState<CafeItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<CafeItem | null>(null);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Desserts");
  const [imageUrl, setImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  useEffect(() => {
    async function fetchData() {
      const data = await getCafeItems();
      if (data) setItems(data as CafeItem[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const openCreateView = () => {
    setEditingItem(null);
    setName(""); setPrice(""); setCategory("Desserts"); setImageUrl("");
    setCurrentView('edit');
  };

  const openEditView = (item: CafeItem) => {
    setEditingItem(item);
    setName(item.name); setPrice(item.price); setCategory(item.category || "Desserts"); setImageUrl(item.image);
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
  };

  const requestDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Cafe Item",
      message: "Are you sure you want to delete this cafe item?",
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCafeItem(id);
      setItems(items.filter(t => t.id !== id));
      if (editingItem?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      
      const url = await uploadProductImage(formData);
      setImageUrl(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const newItem = {
      name, price, category, image: imageUrl || "/images/cafe_placeholder.png"
    };

    try {
      if (editingItem) {
        await updateCafeItem(editingItem.id, newItem);
      } else {
        const res = await createCafeItem(newItem);
        if (res && res.error === 'TABLE_MISSING') {
          alert(`Table is missing in Supabase.\n\nPlease go to your Supabase SQL Editor and run this exactly:\n\nCREATE TABLE cafe_items (\n  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n  name TEXT NOT NULL,\n  price TEXT NOT NULL,\n  image TEXT,\n  category TEXT\n);`);
          setSaving(false);
          return;
        }
      }
      const data = await getCafeItems();
      setItems(data as CafeItem[]);
      closeView();
    } catch (err) {
      console.error(err);
      alert("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <Coffee size={24} /> Le Café
            </h1>
            <p className="text-sm text-stone-500 mt-1">Manage food and drinks for the Cafe page</p>
          </div>
          {currentView === 'list' ? (
            <button 
              onClick={openCreateView}
              className="bg-stone-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus size={16} /> Add Item
            </button>
          ) : (
            <button 
              onClick={closeView}
              className="border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {currentView === 'list' && (
          <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase w-16">Image</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Name</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Category</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Price</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors group cursor-pointer" onClick={() => openEditView(item)}>
                    <td className="py-2 px-4">
                      <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded overflow-hidden relative">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-sm text-stone-900 dark:text-white">{item.name}</td>
                    <td className="py-4 px-4 text-sm text-stone-500">{item.category}</td>
                    <td className="py-4 px-4 text-sm text-stone-500">{item.price}</td>
                    <td className="py-4 px-4 text-right">
                       <button onClick={(e) => { e.stopPropagation(); requestDelete(item.id); }} className="text-stone-400 hover:text-red-500 p-2">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-stone-500 text-sm">No items found.</p>
                        <button 
                          onClick={async () => {
                            setLoading(true);
                            // Simple auto-seed
                            const defaultItems = [
                              { name: "Fleñjure Fruit Snacks", price: "$100", image: "/images/cafe_placeholder.png", category: "Desserts" },
                              { name: "Fleñjure Mazzines", price: "$100", image: "/images/cafe_placeholder.png", category: "Desserts" },
                              { name: "Lays", price: "$10", image: "/images/cafe_placeholder.png", category: "Munchies" }
                            ];
                            for (const item of defaultItems) {
                              const res = await createCafeItem(item);
                              if (res && res.error === 'TABLE_MISSING') {
                                alert(`Table is missing in Supabase.\n\nPlease go to your Supabase SQL Editor and run this exactly:\n\nCREATE TABLE cafe_items (\n  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n  name TEXT NOT NULL,\n  price TEXT NOT NULL,\n  image TEXT,\n  category TEXT\n);`);
                                setLoading(false);
                                return;
                              }
                            }
                            const data = await getCafeItems();
                            setItems(data as CafeItem[]);
                            setLoading(false);
                          }}
                          className="bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                        >
                          Seed Default Data
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {currentView === 'edit' && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <h3 className="text-lg font-medium text-stone-900 dark:text-white">
              {editingItem ? 'Edit Item' : 'New Item'}
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Item Name</label>
                <input
                  type="text" required
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Price (e.g. $10)</label>
                <input
                  type="text" required
                  value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Category</label>
                <select
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                >
                  <option value="Desserts">Desserts</option>
                  <option value="Munchies">Munchies</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Image</label>
                {imageUrl ? (
                  <div className="relative w-32 h-32 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden group">
                    <Image src={imageUrl} alt="preview" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg flex flex-col items-center justify-center p-6 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors cursor-pointer w-32 h-32">
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    <span className="text-xs font-medium mt-2 text-center">{isUploading ? "Uploading..." : "Add Media"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 dark:border-stone-800">
              <button 
                type="button" onClick={closeView}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={saving}
                className="bg-stone-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Item
              </button>
            </div>
          </form>
        )}
      </div>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
}
