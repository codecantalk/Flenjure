"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getCafeItems, createCafeItem, updateCafeItem, deleteCafeItem, uploadProductImage, bulkUpdateCafeItems } from "../actions";
import { 
  Plus, 
  Trash2, 
  Loader2,
  Image as ImageIcon,
  Search,
  Filter,
  Upload,
  ArrowLeft,
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Coffee
} from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { PromptModal } from "@/components/admin/PromptModal";

interface CafeItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  compare_at_price?: string;
  category: string;
  in_stock: boolean;
  inventory_count: number;
  image_urls: string[];
  priority: number;
  image?: string; // For backward compatibility before image_urls was added
  variants?: any[];
}

const categories = ["Desserts", "Drinks", "Munchies", "Other"];

function CafeContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || "";
  
  const [items, setItems] = useState<CafeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<CafeItem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Desserts");
  const [inStock, setInStock] = useState(true);
  const [inventoryCount, setInventoryCount] = useState(10);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [priority, setPriority] = useState(0);
  const [variants, setVariants] = useState<any[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const [promptConfig, setPromptConfig] = useState<{isOpen: boolean; title: string; message: string; type?: "text" | "number"; onConfirm: (val: string) => void}>({
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
    setName(""); setPrice("0"); setCompareAtPrice(""); setDescription("");
    setCategory("Desserts"); setInStock(true); setInventoryCount(10);
    setImageUrls([]); setPriority(0); setVariants([]);
    setCurrentView('edit');
  };

  const openEditView = (item: CafeItem) => {
    setEditingItem(item);
    setName(item.name); setPrice(item.price);
    setCompareAtPrice(item.compare_at_price ? item.compare_at_price.toString() : "");
    setDescription(item.description || ""); setCategory(item.category);
    setInStock(item.in_stock ?? true); setInventoryCount(item.inventory_count ?? 0);
    setImageUrls(item.image_urls || (item.image ? [item.image] : [])); 
    setPriority(item.priority ?? 0);
    setVariants(item.variants || []);
    setCurrentView('edit');
  };

  const closeView = () => setCurrentView('list');

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedItems(filteredItems.map(p => p.id));
    else setSelectedItems([]);
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    else setSelectedItems([...selectedItems, id]);
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
      setItems(items.filter(p => p.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      if (editingItem?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    setModalConfig({
      isOpen: true,
      title: "Delete Multiple Items",
      message: `Are you sure you want to delete ${selectedItems.length} items?`,
      onConfirm: async () => {
        try {
          for (const id of selectedItems) {
            await deleteCafeItem(id);
          }
          setItems(items.filter(p => !selectedItems.includes(p.id)));
          setSelectedItems([]);
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          alert("Failed to delete items.");
        }
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const newUrls = [...imageUrls];
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const url = await uploadProductImage(formData);
        newUrls.push(url);
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

  const moveImageLeft = (index: number) => {
    if (index === 0) return;
    const newUrls = [...imageUrls];
    const temp = newUrls[index - 1];
    newUrls[index - 1] = newUrls[index];
    newUrls[index] = temp;
    setImageUrls(newUrls);
  };

  const moveImageRight = (index: number) => {
    if (index === imageUrls.length - 1) return;
    const newUrls = [...imageUrls];
    const temp = newUrls[index + 1];
    newUrls[index + 1] = newUrls[index];
    newUrls[index] = temp;
    setImageUrls(newUrls);
  };

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

  const handleBulkStatus = async (status: 'active' | 'draft') => {
    if (selectedItems.length === 0) return;
    try {
      await bulkUpdateCafeItems(selectedItems, { in_stock: status === 'active' });
      setItems(items.map(p => selectedItems.includes(p.id) ? { ...p, in_stock: status === 'active' } : p));
      setSelectedItems([]);
    } catch (err) {
      console.error(err);
      alert("Failed to update items.");
    }
  };

  const handleBulkInventory = async () => {
    if (selectedItems.length === 0) return;
    setPromptConfig({
      isOpen: true,
      title: "Update Inventory",
      message: "Enter the new inventory count for all selected items:",
      type: "number",
      onConfirm: async (countStr: string) => {
        const count = parseInt(countStr, 10);
        if (isNaN(count) || count < 0) return alert("Invalid inventory count.");
        try {
          await bulkUpdateCafeItems(selectedItems, { inventory_count: count });
          setItems(items.map(p => selectedItems.includes(p.id) ? { ...p, inventory_count: count } : p));
          setSelectedItems([]);
        } catch (err) {
          console.error(err);
          alert("Failed to update items.");
        }
      }
    });
  };

  const filteredItems = items.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                          statusFilter === 'active' ? p.in_stock === true : 
                          p.in_stock === false;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newItem: Partial<CafeItem> = {
      name, description, price: price.toString(),
      compare_at_price: compareAtPrice || undefined,
      category, in_stock: inStock, inventory_count: inventoryCount,
      image_urls: imageUrls,
      priority,
      variants
    };
    try {
      if (editingItem) await updateCafeItem(editingItem.id, newItem);
      else {
        const res = await createCafeItem(newItem);
        if (res && res.error === 'TABLE_MISSING') {
          alert("Table missing.");
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

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>;

  return (
    <div className="p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <Coffee size={24} /> Le Café
            </h1>
            <p className="text-sm text-stone-500 mt-1">Manage cafe food and drinks</p>
          </div>
          {currentView === 'list' ? (
            <button onClick={openCreateView} className="bg-stone-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Plus size={16} /> Add Cafe Item
            </button>
          ) : (
            <button onClick={closeView} className="border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Back to List
            </button>
          )}
        </div>

        {currentView === 'list' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input type="text" placeholder="Search cafe items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-lg text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors" />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <select value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)} className="pl-9 pr-8 py-2 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-lg text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white appearance-none transition-colors">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                  <span className="bg-stone-900 dark:bg-white text-white dark:text-black w-5 h-5 rounded-full flex items-center justify-center text-xs">{selectedItems.length}</span>
                  selected
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => handleBulkStatus('active')} className="px-3 py-1.5 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-md text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">Set Active</button>
                  <button onClick={() => handleBulkStatus('draft')} className="px-3 py-1.5 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-md text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">Set Draft</button>
                  <button onClick={handleBulkInventory} className="px-3 py-1.5 bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-md text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">Update Inventory</button>
                  <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1"></div>
                  <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 font-medium border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="px-4 py-3 w-10"><input type="checkbox" checked={selectedItems.length === filteredItems.length && filteredItems.length > 0} onChange={handleSelectAll} className="rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:ring-stone-900 dark:focus:ring-white bg-transparent" /></th>
                    <th className="px-4 py-3 w-16">Image</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Inventory</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-900 dark:text-stone-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors group cursor-pointer" onClick={() => handleSelectItem(item.id)}>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} className="rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:ring-stone-900 dark:focus:ring-white bg-transparent" /></td>
                      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); openEditView(item); }}>
                        <div className="w-10 h-10 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden relative flex items-center justify-center">
                          {item.image_urls?.[0] || item.image ? <img src={item.image_urls?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-stone-400" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium" onClick={e => { e.stopPropagation(); openEditView(item); }}>{item.name}</td>
                      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); openEditView(item); }}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${item.in_stock ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"}`}>{item.in_stock ? 'Active' : 'Draft'}</span>
                      </td>
                      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); openEditView(item); }}><span className={item.inventory_count === 0 ? "text-red-600 dark:text-red-400" : "text-stone-600 dark:text-stone-400"}>{item.inventory_count} in stock</span></td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-400" onClick={e => { e.stopPropagation(); openEditView(item); }}>{item.category}</td>
                      <td className="px-4 py-3 text-right text-stone-600 dark:text-stone-400" onClick={e => { e.stopPropagation(); openEditView(item); }}>${Number(item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-500">No cafe items found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'edit' && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Basic Information</h4>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors" />
                </div>
                <div>
                  <div className="flex flex-col mb-1.5">
                    <label className="block text-sm font-medium text-stone-900 dark:text-white">Description (Product Details)</label>
                    <span className="text-[10px] text-stone-500">Each new line will be rendered as a bullet point on the live site.</span>
                  </div>
                  <textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Organic and Locally Sourced&#10;Freshly brewed daily" className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white resize-none transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700" />
                </div>
              </div>
              <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-stone-900 dark:text-white">Media</h4>{isUploading && <Loader2 size={16} className="animate-spin text-stone-500" />}</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 relative">
                  {imageUrls.map((url, index) => (
                    <div key={`${url}-${index}`} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={(e) => handleDrop(e, index)} className={`relative group border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-900 cursor-grab active:cursor-grabbing ${index === 0 ? "col-span-2 row-span-2 aspect-square" : "col-span-1 aspect-square"} ${draggedIndex === index ? "opacity-50" : "opacity-100"}`}>
                      <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/40 transition-colors pointer-events-none"></div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="absolute top-2 right-2 bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm opacity-100 transition-colors hover:text-red-500 dark:hover:text-red-400 z-10"><X size={14} /></button>
                      {index === 0 && <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-stone-700 dark:text-stone-300 pointer-events-none">Main Thumbnail</div>}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-100 z-10">
                        {index > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); moveImageLeft(index); }} className="bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm transition-colors hover:text-stone-900 dark:hover:text-white"><ChevronLeft size={14} /></button>}
                        {index < imageUrls.length - 1 && <button type="button" onClick={(e) => { e.stopPropagation(); moveImageRight(index); }} className="bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm transition-colors hover:text-stone-900 dark:hover:text-white"><ChevronRight size={14} /></button>}
                      </div>
                    </div>
                  ))}
                  <label className={`border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg flex flex-col items-center justify-center p-6 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors cursor-pointer ${imageUrls.length === 0 ? "col-span-2 row-span-2 aspect-square p-8" : "col-span-1 aspect-square"}`}>
                    <Upload size={20} className="mb-2" />
                    <span className="text-xs font-medium">{imageUrls.length === 0 ? "Click to upload primary image" : "Add Media"}</span>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Variants</h4>
                <button 
                  type="button"
                  onClick={() => setVariants([...variants, { size: "OS", color: "", sku: "", inventory_count: 10, price: "" }])}
                  className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  + Add Variant
                </button>
              </div>
              
              {variants.length === 0 ? (
                <p className="text-xs text-stone-500 dark:text-stone-400">No variants added. This product will be treated as one universal size/style.</p>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-3 bg-stone-50 dark:bg-stone-900/50 p-3 rounded-md border border-stone-200 dark:border-stone-800">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                        <input
                          type="text"
                          placeholder="Size (e.g. M, L)"
                          value={variant.size}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].size = e.target.value;
                            setVariants(newVariants);
                          }}
                          className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 px-2 py-1 text-xs outline-none focus:border-stone-900 dark:focus:border-stone-500"
                        />
                        <input
                          type="text"
                          placeholder="Color (Optional)"
                          value={variant.color}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].color = e.target.value;
                            setVariants(newVariants);
                          }}
                          className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 px-2 py-1 text-xs outline-none focus:border-stone-900 dark:focus:border-stone-500"
                        />
                        <input
                          type="text"
                          placeholder="SKU"
                          value={variant.sku}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].sku = e.target.value;
                            setVariants(newVariants);
                          }}
                          className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 px-2 py-1 text-xs outline-none focus:border-stone-900 dark:focus:border-stone-500"
                        />
                        <input
                          type="number"
                          placeholder="Inventory"
                          value={variant.inventory_count}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].inventory_count = Number(e.target.value);
                            setVariants(newVariants);
                          }}
                          className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 px-2 py-1 text-xs outline-none focus:border-stone-900 dark:focus:border-stone-500"
                        />
                        <input
                          type="text"
                          placeholder="Price (Optional)"
                          value={variant.price || ""}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].price = e.target.value;
                            setVariants(newVariants);
                          }}
                          className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 px-2 py-1 text-xs outline-none focus:border-stone-900 dark:focus:border-stone-500"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                        className="text-stone-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-stone-900 dark:text-white">Status</h4><span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${inStock ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"}`}>{inStock ? 'Active' : 'Draft'}</span></div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setInStock(!inStock)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inStock ? 'bg-stone-900 dark:bg-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black shadow ring-0 transition duration-200 ease-in-out ${inStock ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm text-stone-700 dark:text-stone-300 font-medium">Publish to site</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">Draft items are hidden from your store.</p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                      <input type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md pl-7 pr-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Compare at</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                      <input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md pl-7 pr-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Inventory</h4>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Quantity</label>
                  <input type="number" min="0" value={inventoryCount} onChange={(e) => setInventoryCount(parseInt(e.target.value))} className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors" />
                </div>
              </div>
              <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Organization</h4>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Display Priority</label>
                  <input type="number" min="0" value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 0)} className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors" />
                  <p className="text-xs text-stone-500 mt-1">Higher numbers appear first.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-between gap-3">
                {editingItem && <button type="button" onClick={() => requestDelete(editingItem.id)} className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"><Trash2 size={16} /> Delete</button>}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={closeView} className="px-4 py-2 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={saving || isUploading} className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-black hover:opacity-90 rounded-lg text-sm font-medium transition-opacity flex items-center gap-2 disabled:opacity-50">{saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Item'}</button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      <ConfirmModal isOpen={modalConfig.isOpen} title={modalConfig.title} message={modalConfig.message} onConfirm={modalConfig.onConfirm} onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })} />
      <PromptModal isOpen={promptConfig.isOpen} title={promptConfig.title} message={promptConfig.message} type={promptConfig.type} onConfirm={promptConfig.onConfirm} onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false })} />
    </div>
  );
}

export default function AdminCafePage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-64px)] items-center justify-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>}>
      <CafeContent />
    </Suspense>
  );
}
