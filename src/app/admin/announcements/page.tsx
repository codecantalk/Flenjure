"use client";

import { useEffect, useState } from "react";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../actions";
import { Plus, Trash2, Loader2, ArrowLeft, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  full_content: string;
  created_at?: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });
  
  // Form State
  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [category, setCategory] = useState("Releases");
  const [excerpt, setExcerpt] = useState("");
  const [fullContent, setFullContent] = useState("");

  const categories = ["Releases", "News", "Partnerships", "Editorial"];

  const mockAnnouncements: Announcement[] = [
    {
      id: "mock-1",
      title: "Spring/Summer 2026: The Uniform of Joy",
      date: "April 24, 2026",
      category: "Releases",
      excerpt: "Establishing the core silhouettes for the upcoming season, focusing on superior drape, raw textures, and effortless transition.",
      full_content: "The Spring/Summer 2026 collection 'The Uniform of Joy' redefines everyday elegance through a series of elevated essentials. By incorporating premium, lightweight materials that offer superior drape, we've designed pieces that move with the wearer. The color palette draws from nature's most vivid moments—sun-bleached terracotta, deep ocean blues, and crisp cotton whites. Each garment is meticulously tailored to ensure a flawless fit while maintaining a relaxed, effortless attitude that transitions seamlessly from day to night."
    }
  ];

  useEffect(() => {
    async function fetchData() {
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) {
        setAnnouncements(mockAnnouncements);
        setLoading(false);
        return;
      }

      try {
        const data = await getAnnouncements();
        if (data && data.length > 0) {
          setAnnouncements(data as Announcement[]);
        }
      } catch (err) {
        console.error("Error loading announcements:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const channel = supabase.channel('realtime:admin:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        async () => {
          const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
          if (!isMissingEnv) {
            const freshData = await getAnnouncements();
            if (freshData) setAnnouncements(freshData as Announcement[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openCreateView = () => {
    setEditingItem(null);
    setTitle("");
    setDateStr(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    setCategory("Releases");
    setExcerpt("");
    setFullContent("");
    setCurrentView('edit');
  };

  const openEditView = (item: Announcement) => {
    setEditingItem(item);
    setTitle(item.title);
    setDateStr(item.date);
    setCategory(item.category);
    setExcerpt(item.excerpt);
    setFullContent(item.full_content);
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
  };

  const requestDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Announcement",
      message: "Are you sure you want to delete this announcement? This action cannot be undone.",
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = async (id: string) => {

    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      setAnnouncements(announcements.filter(a => a.id !== id));
      if (editingItem?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
      return;
    }

    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
      if (editingItem?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete announcement.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Omit<Announcement, "id" | "created_at"> = {
      title,
      date: dateStr,
      category,
      excerpt,
      full_content: fullContent
    };

    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      if (editingItem) {
        setAnnouncements(announcements.map(a => a.id === editingItem.id ? { ...a, ...newItem } : a));
      } else {
        setAnnouncements([{ ...newItem, id: Math.random().toString() }, ...announcements]);
      }
      closeView();
      return;
    }

    try {
      let res;
      if (editingItem && !editingItem.id.startsWith("mock-")) {
        res = await updateAnnouncement(editingItem.id, newItem);
      } else {
        res = await createAnnouncement(newItem);
      }
      
      if (res && "error" in res && res.error === 'TABLE_MISSING') {
        alert(`Table missing in Supabase.\n\nPlease go to your Supabase SQL Editor and run the SQL snippet from the implementation plan.`);
        return;
      }
      
      const data = await getAnnouncements();
      if (data) setAnnouncements(data as Announcement[]);
      closeView();
    } catch (err) {
      console.error(err);
      alert("Failed to save announcement.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (currentView === 'edit') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={closeView} className="p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-md transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-serif text-stone-900 dark:text-white">
              {editingItem ? "Edit Announcement" : "New Announcement"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {editingItem && (
              <button 
                type="button" 
                onClick={() => requestDelete(editingItem.id)} 
                className="px-4 py-2 rounded-md text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Delete
              </button>
            )}
            <button 
              onClick={handleSubmit} 
              className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-2 rounded-md text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] p-8 border border-stone-200 dark:border-stone-800 rounded-xl space-y-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Headline Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
                placeholder="e.g. Spring/Summer 2026: The Uniform of Joy"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Display Date</label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="e.g. April 24, 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Short Excerpt (Teaser)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
                placeholder="A brief 1-2 sentence summary..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Full Article Content</label>
              <textarea
                value={fullContent}
                onChange={(e) => setFullContent(e.target.value)}
                rows={10}
                className="w-full bg-stone-50 dark:bg-[#0a0a0a] border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 font-serif leading-relaxed"
                placeholder="The complete editorial text..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif text-stone-900 dark:text-white">The Dispatch</h1>
            <p className="text-sm text-stone-500 mt-1">Manage announcements and editorial content.</p>
          </div>
          <button 
            onClick={openCreateView}
            className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors"
          >
            <Plus size={16} /> New Article
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((item) => (
            <div 
              key={item.id} 
              onClick={() => openEditView(item)}
              className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 group"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">{item.date}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-300 dark:text-stone-600 font-medium">{item.category}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); requestDelete(item.id); }}
                  className="text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-serif text-xl text-stone-900 dark:text-white leading-tight">{item.title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
                {item.excerpt}
              </p>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="col-span-full py-12 text-center text-stone-500 border border-dashed border-stone-300 dark:border-stone-800 rounded-xl">
              No announcements found. Publish your first article.
            </div>
          )}
        </div>

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
