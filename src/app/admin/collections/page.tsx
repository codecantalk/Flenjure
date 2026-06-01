"use client";

import { useEffect, useState } from "react";
import { getCollections, createCollection, updateCollection, deleteCollection, uploadProductImage } from "../actions";
import { 
  Plus, 
  Trash2, 
  Loader2,
  FolderOpen,
  Image as ImageIcon,
  Search,
  Filter,
  Upload,
  ArrowLeft,
  X,
  Edit2
} from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

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
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // List Filters & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [order, setOrder] = useState(0);

  // Modals
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const mockCollections: Collection[] = [
    {
      id: "col-1",
      name: "Flenjure Core Apparel",
      slug: "flenjure-core-apparel",
      description: "Signature Flenjure pieces engineered for daily comfort and timeless style.",
      image_url: "https://cdn.sanity.io/images/nkccolc2/production/b9eebe9634ca12b2998fe561c0d1afffbcdf0cdc-1500x1500.jpg",
      order: 1
    },
    {
      id: "col-2",
      name: "Accessories & Bags",
      slug: "accessories-bags",
      description: "Premium bags and curated objects from the Flenjure universe.",
      image_url: "https://cdn.sanity.io/images/nkccolc2/production/7b8b4a07f0fb1e5b4b72605f1559edec954d6d67-2000x2000.png",
      order: 2
    },
    {
      id: "col-3",
      name: "Snacks / Munchies",
      slug: "snacks-munchies",
      description: "Curated snacks to fuel the experience.",
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
        const data = await getCollections();
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

  const openCreateView = () => {
    setEditingCollection(null);
    setName(""); setSlug(""); setDescription(""); setImageUrls([]); setOrder(0);
    setCurrentView('edit');
  };

  const openEditView = (collection: Collection) => {
    setEditingCollection(collection);
    setName(collection.name); setSlug(collection.slug); setDescription(collection.description || "");
    const initialImages = collection.image_url 
      ? collection.image_url.split(",").map(s => s.trim()).filter(Boolean) 
      : [];
    setImageUrls(initialImages); 
    setOrder(collection.order);
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
  };

  const requestDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Collection",
      message: "Are you sure you want to delete this collection? This cannot be undone.",
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = async (id: string) => {
    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      setCollections(collections.filter(c => c.id !== id));
      setSelectedCollections(selectedCollections.filter(selId => selId !== id));
      if (editingCollection?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
      return;
    }

    try {
      await deleteCollection(id);
      setCollections(collections.filter(c => c.id !== id));
      if (editingCollection?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinedImageUrl = imageUrls.join(", ");
    
    const newCol: Omit<Collection, "id"> = {
      name, slug, description, image_url: joinedImageUrl, order
    };

    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      if (editingCollection) {
        setCollections(collections.map(c => c.id === editingCollection.id ? { ...c, ...newCol } : c));
      } else {
        setCollections([...collections, { ...newCol, id: Math.random().toString(), slug: slug || "auto" }]);
      }
      closeView();
      return;
    }

    try {
      if (editingCollection && !editingCollection.id.startsWith("col-")) {
        await updateCollection(editingCollection.id, newCol);
      } else {
        await createCollection(newCol);
      }
      const data = await getCollections();
      if (data) setCollections(data as Collection[]);
      closeView();
    } catch (err) {
      console.error("Save collection failed:", err);
      alert("Failed to save.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedCollections.length === filteredCollections.length && filteredCollections.length > 0) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(filteredCollections.map(c => c.id));
    }
  };

  const toggleSelectCollection = (id: string) => {
    if (selectedCollections.includes(id)) {
      setSelectedCollections(selectedCollections.filter(selId => selId !== id));
    } else {
      setSelectedCollections([...selectedCollections, id]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    const newUrls = [...imageUrls];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        
        const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
        if (isMissingEnv) {
          const fakeUrl = "https://via.placeholder.com/500?text=Mock+Upload";
          newUrls.push(fakeUrl);
        } else {
          const url = await uploadProductImage(formData);
          newUrls.push(url);
        }
      }
      setImageUrls(newUrls);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newUrls = [...imageUrls];
    const itemToMove = newUrls[draggedIndex];
    newUrls.splice(draggedIndex, 1);
    newUrls.splice(dropIndex, 0, itemToMove);
    
    setImageUrls(newUrls);
    setDraggedIndex(null);
  };

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-stone-500">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
      </div>
    );
  }

  if (currentView === 'edit') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={closeView} 
              className="p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-md transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
              {editingCollection ? editingCollection.name : "Create collection"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {editingCollection && (
              <button 
                type="button" 
                onClick={() => requestDelete(editingCollection.id)} 
                className="px-3 py-1.5 rounded-md text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Delete
              </button>
            )}
            <button 
              onClick={handleSubmit} 
              className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors shadow-sm"
            >
              Save
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            
            {/* Title & Description */}
            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-white mb-1.5">Title</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Collection"
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-white mb-1.5">Description</label>
                <textarea
                  rows={6} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white resize-none transition-colors"
                />
              </div>
            </div>

            {/* Media Grid */}
            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Collection images</h4>
                {isUploading && <Loader2 size={16} className="animate-spin text-stone-500" />}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 relative">
                
                {/* Images */}
                {imageUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`
                      relative group border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-900 cursor-grab active:cursor-grabbing
                      ${index === 0 ? "col-span-2 row-span-2 aspect-square" : "col-span-1 aspect-square"}
                      ${draggedIndex === index ? "opacity-50" : "opacity-100"}
                    `}
                  >
                    <img 
                      src={url} 
                      alt={`Collection media ${index + 1}`} 
                      className="w-full h-full object-cover pointer-events-none" 
                    />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/40 transition-colors pointer-events-none"></div>
                    
                    {/* Delete Button */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-2 right-2 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 dark:hover:text-red-400 z-10"
                    >
                      <X size={14} />
                    </button>
                    
                    {/* Label for primary */}
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-stone-700 dark:text-stone-300 pointer-events-none">
                        Main Thumbnail
                      </div>
                    )}
                  </div>
                ))}

                {/* Upload Button */}
                <div className={`
                  border border-dashed border-stone-300 dark:border-stone-700 rounded-lg flex flex-col items-center justify-center text-center relative hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors
                  ${imageUrls.length === 0 ? "col-span-2 row-span-2 aspect-square p-8" : "col-span-1 aspect-square"}
                `}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                  />
                  <div className={`
                    rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400
                    ${imageUrls.length === 0 ? "w-12 h-12 mb-3" : "w-8 h-8"}
                  `}>
                    {imageUrls.length === 0 ? <Upload size={20} /> : <Plus size={16} />}
                  </div>
                  {imageUrls.length === 0 && (
                    <span className="text-sm font-medium text-stone-900 dark:text-white">Click or drop images to upload</span>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="md:w-80 space-y-6 shrink-0">
            {/* Organization Card */}
            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Display Settings</h4>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Sort Order</label>
                <input
                  type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                />
                <p className="text-xs text-stone-500 mt-1.5">Lower numbers appear first on the site.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // --- LIST VIEW ---
  const firstImageUrl = (col: Collection) => {
    if (!col.image_url) return null;
    return col.image_url.split(",")[0].trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Collections</h2>
        <button
          onClick={openCreateView}
          className="flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Create Collection</span>
        </button>
      </div>

      {/* Toolbar & Filters (Shopify Style) */}
      <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-3 flex items-center gap-2 bg-white dark:bg-[#111]">
          <div className="relative flex-1 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input 
              type="text" 
              placeholder="Search collections"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md pl-9 pr-3 py-1.5 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors"
            />
          </div>
          <button className="p-1.5 rounded-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 flex items-center gap-1.5 px-3">
            <Filter size={14} />
            <span className="text-sm font-medium hidden sm:inline">More filters</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border-t border-stone-200 dark:border-stone-800">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 font-medium border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-4 py-2.5 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedCollections.length === filteredCollections.length && filteredCollections.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-stone-300 dark:border-stone-600 text-stone-900 dark:text-white focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="px-4 py-2.5 font-medium">Collection</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
                <th className="px-4 py-2.5 font-medium text-center">Sort Order</th>
                <th className="px-4 py-2.5 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-900 dark:text-stone-100">
              {filteredCollections.map((col) => {
                const img = firstImageUrl(col);
                return (
                  <tr 
                    key={col.id} 
                    className="group hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedCollections.includes(col.id)}
                        onChange={() => toggleSelectCollection(col.id)}
                        className="rounded border-stone-300 dark:border-stone-600 text-stone-900 dark:text-white focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3" onClick={() => openEditView(col)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden flex-shrink-0 bg-stone-50 dark:bg-stone-900">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FolderOpen size={16} className="text-stone-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm hover:underline text-left">
                            {col.name}
                          </span>
                          <span className="text-xs text-stone-500 mt-0.5">/{col.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400 text-xs max-w-xs truncate" onClick={() => openEditView(col)}>
                      {col.description || "No description provided"}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={() => openEditView(col)}>
                      <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-xs text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                        {col.order}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCollections.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-stone-500 text-sm">No collections found matching your filter.</p>
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
