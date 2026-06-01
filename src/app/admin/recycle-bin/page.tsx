"use client";

import { useEffect, useState } from "react";
import { 
  getDeletedProducts, restoreProduct, permanentlyDeleteProduct,
  getDeletedCollections, restoreCollection, permanentlyDeleteCollection,
  getDeletedAudioTracks, restoreAudioTrack, permanentlyDeleteAudioTrack,
  getDeletedCafeItems, restoreCafeItem, permanentlyDeleteCafeItem,
  getDeletedAnnouncements, restoreAnnouncement, permanentlyDeleteAnnouncement
} from "../actions";
import { Loader2, RefreshCw, Trash2, ArrowLeft } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

type Tab = "Products" | "Collections" | "Audio" | "Cafe" | "Announcements";

export default function RecycleBinPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Products");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (activeTab === "Products") setItems(await getDeletedProducts());
      if (activeTab === "Collections") setItems(await getDeletedCollections());
      if (activeTab === "Audio") setItems(await getDeletedAudioTracks());
      if (activeTab === "Cafe") setItems(await getDeletedCafeItems());
      if (activeTab === "Announcements") setItems(await getDeletedAnnouncements());
    } catch (err) {
      console.error("Failed to load recycle bin items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleRestore = async (id: string) => {
    try {
      if (activeTab === "Products") await restoreProduct(id);
      if (activeTab === "Collections") await restoreCollection(id);
      if (activeTab === "Audio") await restoreAudioTrack(id);
      if (activeTab === "Cafe") await restoreCafeItem(id);
      if (activeTab === "Announcements") await restoreAnnouncement(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to restore item.");
    }
  };

  const handlePermanentDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Permanently Delete",
      message: "Are you sure you want to permanently delete this item? This action cannot be undone.",
      onConfirm: async () => {
        try {
          if (activeTab === "Products") await permanentlyDeleteProduct(id);
          if (activeTab === "Collections") await permanentlyDeleteCollection(id);
          if (activeTab === "Audio") await permanentlyDeleteAudioTrack(id);
          if (activeTab === "Cafe") await permanentlyDeleteCafeItem(id);
          if (activeTab === "Announcements") await permanentlyDeleteAnnouncement(id);
          setItems(items.filter(item => item.id !== id));
        } catch (err) {
          console.error(err);
          alert("Failed to permanently delete item.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-2">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center">
          <Trash2 size={20} />
        </div>
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Recycle Bin</h2>
      </div>

      <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto items-center gap-1 px-2 pt-2 border-b border-stone-200 dark:border-stone-800 no-scrollbar">
          {(["Products", "Collections", "Audio", "Cafe", "Announcements"] as Tab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white border-b-2 border-stone-900 dark:border-white' 
                  : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-500">
            <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-500 px-4 text-center">
            <Trash2 size={48} strokeWidth={1} className="text-stone-300 dark:text-stone-700 mb-4" />
            <p className="text-sm">The recycle bin is empty for {activeTab.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 font-medium border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Name / Title</th>
                  <th className="px-4 py-3 font-medium">Deleted At</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-900 dark:text-stone-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {item.title || item.name || `Item ${item.id.substring(0, 8)}`}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        ID: {item.id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {item.deleted_at ? new Date(item.deleted_at).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw size={14} />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={14} />
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
