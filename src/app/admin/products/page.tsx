"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, getCollections, createProduct, updateProduct, deleteProduct, uploadProductImage, bulkUpdateProducts } from "../actions";
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
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { PromptModal } from "@/components/admin/PromptModal";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  in_stock: boolean;
  inventory_count: number;
  image_urls: string[];
  priority: number;
  collection_id?: string;
  variants?: any[];
}

interface Collection {
  id: string;
  name: string;
}

function AdminProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // List Filters & Selection
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
  
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const [promptConfig, setPromptConfig] = useState<{isOpen: boolean; title: string; message: string; type: 'text'|'number'; onConfirm: (val: string) => void}>({
    isOpen: false, title: '', message: '', type: 'text', onConfirm: () => {}
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Form State
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Apparel");
  const [inStock, setInStock] = useState(true);
  const [inventoryCount, setInventoryCount] = useState(10);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [priority, setPriority] = useState(0);
  const [collectionId, setCollectionId] = useState("");
  const [variants, setVariants] = useState<any[]>([]);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const mockProducts: Product[] = [
    {
      id: "prod-1",
      title: "Fleñjure OG Jersey",
      slug: "flenjure-og-jersey",
      description: "Signature Flenjure jersey, standard fit.",
      price: 60.00,
      compare_at_price: 80.00,
      category: "Apparel",
      in_stock: true,
      inventory_count: 50,
      image_urls: ["https://cdn.sanity.io/images/nkccolc2/production/b9eebe9634ca12b2998fe561c0d1afffbcdf0cdc-1500x1500.jpg"],
      priority: 10
    },
    {
      id: "prod-2",
      title: "Fleñjure Bag Packs",
      slug: "flenjure-bag-packs",
      description: "Flenjure branded bag packs in multiple sizes.",
      price: 5.00,
      category: "Accessories",
      in_stock: true,
      inventory_count: 100,
      image_urls: ["https://cdn.sanity.io/images/nkccolc2/production/7b8b4a07f0fb1e5b4b72605f1559edec954d6d67-2000x2000.png"],
      priority: 9
    }
  ];

  const categories = ["Apparel", "Hats", "Accessories", "Snacks", "Munchies"];

  useEffect(() => {
    async function fetchData() {
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isMissingEnv) {
        setProducts(mockProducts);
        setCollections([
          { id: "col-1", name: "Spring / Summer 2026" },
          { id: "col-2", name: "Uniform" }
        ]);
        setLoading(false);
        return;
      }

      try {
        const dbProducts = await getProducts();
        const dbCollections = await getCollections();

        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts as Product[]);
        }

        if (dbCollections) setCollections(dbCollections as Collection[]);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const channel = supabase.channel('realtime:admin:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
          if (!isMissingEnv) {
            const freshData = await getProducts();
            if (freshData && freshData.length > 0) {
              setProducts(freshData as Product[]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openCreateView = () => {
    setEditingProduct(null);
    setTitle(""); setSlug(""); setPrice(0); setCompareAtPrice(""); setDescription("");
    setCategory("Apparel"); setInStock(true); setInventoryCount(10);
    setImageUrls([]); setPriority(0); setCollectionId("");
    setVariants([]);
    setCurrentView('edit');
  };

  const openEditView = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title); setSlug(product.slug); setPrice(product.price);
    setCompareAtPrice(product.compare_at_price ? product.compare_at_price.toString() : "");
    setDescription(product.description || ""); setCategory(product.category);
    setInStock(product.in_stock); setInventoryCount(product.inventory_count);
    setImageUrls(product.image_urls || []); setPriority(product.priority);
    setCollectionId(product.collection_id || "");
    setVariants(product.variants || []);
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
  };

  const requestDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to permanently delete this product? This action cannot be undone.",
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = async (id: string) => {
    const isMissingEnv = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      setProducts(products.filter(p => p.id !== id));
      setSelectedProducts(selectedProducts.filter(selId => selId !== id));
      if (editingProduct?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
      return;
    }

    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setSelectedProducts(selectedProducts.filter(selId => selId !== id));
      if (editingProduct?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProd: Omit<Product, "id"> = {
      title, slug, description, price,
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
      category, in_stock: inStock, inventory_count: inventoryCount,
      image_urls: imageUrls,
      priority, collection_id: collectionId || undefined,
      variants
    };

    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProd } : p));
      } else {
        setProducts([{ ...newProd, id: Math.random().toString() }, ...products]);
      }
      closeView();
      return;
    }

    try {
      let res;
      if (editingProduct && !editingProduct.id.startsWith("prod-")) {
        res = await updateProduct(editingProduct.id, newProd);
      } else {
        res = await createProduct(newProd);
      }
      
      const data = await getProducts();
      if (data) setProducts(data as Product[]);
      closeView();
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(selId => selId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
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

  const handleExport = () => {
    if (filteredProducts.length === 0) {
      alert("No products to export.");
      return;
    }
    
    const headers = ["ID", "Title", "Slug", "Price", "Compare At Price", "Category", "Status", "Inventory Count", "Priority", "Collection ID"];
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.slug,
      p.price,
      p.compare_at_price || "",
      `"${p.category.replace(/"/g, '""')}"`,
      p.in_stock ? "Active" : "Draft",
      p.inventory_count,
      p.priority,
      p.collection_id || ""
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `flenjure-products-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkStatus = async (status: 'active' | 'draft') => {
    if (selectedProducts.length === 0) return;
    try {
      const isMissingEnv = 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
      
      if (!isMissingEnv) {
        await bulkUpdateProducts(selectedProducts, { in_stock: status === 'active' });
      }
      
      setProducts(products.map(p => {
        if (selectedProducts.includes(p.id)) {
          return { ...p, in_stock: status === 'active' };
        }
        return p;
      }));
      setSelectedProducts([]);
    } catch (err) {
      console.error(err);
      alert("Failed to update products.");
    }
  };

  const handleBulkInventory = async () => {
    if (selectedProducts.length === 0) return;
    
    setPromptConfig({
      isOpen: true,
      title: "Update Inventory",
      message: "Enter the new inventory count for all selected products:",
      type: "number",
      onConfirm: async (countStr: string) => {
        const count = parseInt(countStr, 10);
        if (isNaN(count) || count < 0) return alert("Invalid inventory count.");

        try {
          const isMissingEnv = 
            !process.env.NEXT_PUBLIC_SUPABASE_URL || 
            process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
          
          if (!isMissingEnv) {
            await bulkUpdateProducts(selectedProducts, { inventory_count: count });
          }

          setProducts(products.map(p => {
            if (selectedProducts.includes(p.id)) {
              return { ...p, inventory_count: count };
            }
            return p;
          }));
          setSelectedProducts([]);
        } catch (err) {
          console.error(err);
          alert("Failed to update products.");
        }
      }
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                          statusFilter === 'active' ? p.in_stock === true : 
                          p.in_stock === false;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={closeView} 
              className="p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-md transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
              {editingProduct ? editingProduct.title : "Add product"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {editingProduct && (
              <button 
                type="button" 
                onClick={() => requestDelete(editingProduct.id)} 
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

        <form id="productForm" onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-white mb-1.5">Title</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Signature Tee"
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                />
              </div>
              <div>
                <div className="flex flex-col mb-1.5">
                  <label className="block text-sm font-medium text-stone-900 dark:text-white">Description (Product Details)</label>
                  <span className="text-[10px] text-stone-500">Each new line will be rendered as a bullet point on the live site.</span>
                </div>
                <textarea
                  rows={8} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Heavyweight Premium Cotton&#10;Reinforced Stitching&#10;Pre-shrunk for Perfect Fit"
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white resize-none transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Media</h4>
                {isUploading && <Loader2 size={16} className="animate-spin text-stone-500" />}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 relative">
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
                      alt={`Product media ${index + 1}`} 
                      className="w-full h-full object-cover pointer-events-none" 
                    />
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/40 transition-colors pointer-events-none"></div>
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-2 right-2 bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm opacity-100 transition-colors hover:text-red-500 dark:hover:text-red-400 z-10"
                    >
                      <X size={14} />
                    </button>
                    
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-stone-700 dark:text-stone-300 pointer-events-none">
                        Main Thumbnail
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-100 z-10">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImageLeft(index);
                          }}
                          className="bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm transition-colors hover:text-stone-900 dark:hover:text-white"
                        >
                          <ChevronLeft size={14} />
                        </button>
                      )}
                      {index < imageUrls.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImageRight(index);
                          }}
                          className="bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 p-1.5 rounded-md shadow-sm transition-colors hover:text-stone-900 dark:hover:text-white"
                        >
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <label className={`
                  border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg flex flex-col items-center justify-center p-6 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors cursor-pointer
                  ${imageUrls.length === 0 ? "col-span-2 row-span-2 aspect-square p-8" : "col-span-1 aspect-square"}
                `}>
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

            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Pricing</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-900 dark:text-white mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                    <input
                      type="number" step="0.01" required value={price} onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md pl-7 pr-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-900 dark:text-white mb-1.5">Compare-at price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                    <input
                      type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)}
                      className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md pl-7 pr-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Inventory</h4>
              <div className="border border-stone-200 dark:border-stone-800 rounded-md overflow-hidden">
                <div className="bg-stone-50 dark:bg-stone-900/50 px-4 py-2 border-b border-stone-200 dark:border-stone-800 flex justify-between text-xs font-medium text-stone-500">
                  <span>Location</span>
                  <span>Available</span>
                </div>
                
                <div className="p-4 flex flex-col gap-2 border-b border-stone-200 dark:border-stone-800">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">URL Handle (Slug)</label>
                  <input
                    type="text"
                    required={!!editingProduct}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                    placeholder="e.g., flenjure-anthem-tee"
                    className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                  />
                  <p className="text-xs text-stone-500">The URL for your product: https://flenjure.com/shop/<strong>{slug || "auto-generated"}</strong></p>
                </div>

                <div className="px-4 py-3 flex justify-between items-center bg-white dark:bg-[#111]">
                  <span className="text-sm font-medium text-stone-900 dark:text-white">Shop location</span>
                  <input
                    type="number" value={inventoryCount} onChange={(e) => setInventoryCount(Number(e.target.value))}
                    className="w-24 bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-80 space-y-6 shrink-0">
            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Status</h4>
              <select
                value={inStock ? "active" : "draft"} onChange={(e) => setInStock(e.target.value === "active")}
                className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Product organization</h4>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Category</label>
                <select
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Collection</label>
                <select
                  value={collectionId} onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                >
                  <option value="">None</option>
                  {collections.map((col) => <option key={col.id} value={col.id}>{col.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Sort Priority</label>
                <input
                  type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500 text-stone-900 dark:text-white transition-colors"
                />
              </div>
            </div>
          </div>
        </form>
        <ConfirmModal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        />
        <PromptModal
          isOpen={promptConfig.isOpen}
          title={promptConfig.title}
          message={promptConfig.message}
          type={promptConfig.type}
          onConfirm={promptConfig.onConfirm}
          onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Products</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="px-3 py-1.5 text-sm font-medium border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#111] text-stone-900 dark:text-white rounded-md shadow-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors hidden sm:block"
          >
            Export
          </button>
          <button
            onClick={openCreateView}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 px-2 pt-2 border-b border-stone-200 dark:border-stone-800">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors ${statusFilter === 'all' ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white border-b-2 border-stone-900 dark:border-white' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors ${statusFilter === 'active' ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white border-b-2 border-stone-900 dark:border-white' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors ${statusFilter === 'draft' ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white border-b-2 border-stone-900 dark:border-white' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            Draft
          </button>
        </div>

        <div className="p-3 flex items-center gap-2 bg-white dark:bg-[#111]">
          <div className="relative flex-1 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input 
              type="text" 
              placeholder="Search products"
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

        {selectedProducts.length > 0 && (
          <div className="bg-stone-50 dark:bg-stone-800/60 px-4 py-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
              {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => handleBulkStatus('active')}
                className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-sm"
              >
                Set as Active
              </button>
              <button 
                onClick={() => handleBulkStatus('draft')}
                className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-sm"
              >
                Set as Draft
              </button>
              <button 
                onClick={handleBulkInventory}
                className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-sm"
              >
                Update Inventory
              </button>
              <button 
                onClick={() => {
                  setModalConfig({
                    isOpen: true,
                    title: "Delete Selected",
                    message: "Are you sure you want to delete the selected products? This action cannot be undone.",
                    onConfirm: async () => {
                      for (const id of selectedProducts) {
                        await deleteProduct(id);
                      }
                      setProducts(products.filter(p => !selectedProducts.includes(p.id)));
                      setSelectedProducts([]);
                      setModalConfig(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                }}
                className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm ml-2"
              >
                <Trash2 size={14} className="inline mr-1 -mt-0.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto border-t border-stone-200 dark:border-stone-800">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 font-medium border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-4 py-2.5 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-stone-300 dark:border-stone-600 text-stone-900 dark:text-white focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Inventory</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-900 dark:text-stone-100">
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="rounded border-stone-300 dark:border-stone-600 text-stone-900 dark:text-white focus:ring-0 cursor-pointer w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-3" onClick={() => openEditView(product)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden flex-shrink-0 bg-stone-50 dark:bg-stone-900">
                        {product.image_urls[0] ? (
                          <img src={product.image_urls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={14} className="text-stone-400" />
                        )}
                      </div>
                      <span className="font-semibold text-sm hover:underline">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={() => openEditView(product)}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border
                      ${product.in_stock ? "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700" : "bg-stone-100 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"}
                    `}>
                      {product.in_stock ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" onClick={() => openEditView(product)}>
                    <span className={product.inventory_count === 0 ? "text-red-600 dark:text-red-400" : "text-stone-600 dark:text-stone-400"}>
                      {product.inventory_count} in stock
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-400" onClick={() => openEditView(product)}>
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-stone-600 dark:text-stone-400" onClick={() => openEditView(product)}>
                    ${product.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-stone-500 text-sm">No products found matching your filter.</p>
            </div>
          )}
        </div>
      {/* End of list view */}
      </div>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
      <PromptModal
        isOpen={promptConfig.isOpen}
        title={promptConfig.title}
        message={promptConfig.message}
        type={promptConfig.type}
        onConfirm={promptConfig.onConfirm}
        onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false })}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-64px)] items-center justify-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>}>
      <AdminProductsPageContent />
    </Suspense>
  );
}
