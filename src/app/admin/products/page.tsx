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
  Image as ImageIcon,
  Search,
  Filter,
  MoreVertical,
  ArrowUpDown
} from "lucide-react";

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
}

interface Collection {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Apparel");
  const [inStock, setInStock] = useState(true);
  const [inventoryCount, setInventoryCount] = useState(10);
  const [imageUrlStr, setImageUrlStr] = useState("");
  const [priority, setPriority] = useState(0);
  const [collectionId, setCollectionId] = useState("");

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
    },
    {
      id: "prod-3",
      title: "Sour Patch Kids 226g",
      slug: "sour-patch-kids",
      description: "Classic sour then sweet candy.",
      price: 4.99,
      category: "Snacks",
      in_stock: true,
      inventory_count: 24,
      image_urls: ["https://cdn.sanity.io/images/nkccolc2/production/e004f53efa12234a758ebc9e741dcc9e6c83a2c9-1800x1800.jpg"],
      priority: 8
    },
    {
      id: "prod-4",
      title: "Pop-Tarts® 384g",
      slug: "pop-tarts",
      description: "Frosted Pop-Tarts in various flavors.",
      price: 2.99,
      category: "Snacks",
      in_stock: true,
      inventory_count: 15,
      image_urls: ["https://cdn.sanity.io/images/nkccolc2/production/a3579a4e79b29afb058726761e247845e2d84c42-640x640.png"],
      priority: 7
    },
    {
      id: "prod-5",
      title: "GUSHERS™ Tropical Fruit Snacks",
      slug: "gushers-tropical-fruit-snacks",
      description: "Tropical flavored Gushers.",
      price: 3.99,
      category: "Snacks",
      in_stock: false,
      inventory_count: 0,
      image_urls: ["https://cdn.sanity.io/images/nkccolc2/production/794ca45e0e03847c6e8264a687380b3bf8324938-480x480.png"],
      priority: 6
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
        const { data: dbProducts } = await supabase
          .from("products")
          .select("*")
          .order("priority", { ascending: false });

        const { data: dbCollections } = await supabase
          .from("collections")
          .select("id, name");

        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts as Product[]);
        } else {
          setProducts(mockProducts);
        }

        if (dbCollections) setCollections(dbCollections);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle(""); setPrice(0); setCompareAtPrice(""); setDescription("");
    setCategory("Apparel"); setInStock(true); setInventoryCount(10);
    setImageUrlStr(""); setPriority(0); setCollectionId("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title); setPrice(product.price);
    setCompareAtPrice(product.compare_at_price ? product.compare_at_price.toString() : "");
    setDescription(product.description || ""); setCategory(product.category);
    setInStock(product.in_stock); setInventoryCount(product.inventory_count);
    setImageUrlStr((product.image_urls || []).join(", ")); setPriority(product.priority);
    setCollectionId(product.collection_id || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;

    const isMissingEnv = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      setProducts(products.filter(p => p.id !== id));
      setSelectedProducts(selectedProducts.filter(selId => selId !== id));
      return;
    }

    try {
      await supabase.from("products").delete().eq("id", id);
      setProducts(products.filter(p => p.id !== id));
      setSelectedProducts(selectedProducts.filter(selId => selId !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrls = imageUrlStr.split(",").map(url => url.trim()).filter(Boolean);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newProd: Omit<Product, "id"> = {
      title, slug, description, price,
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
      category, in_stock: inStock, inventory_count: inventoryCount,
      image_urls: cleanUrls.length ? cleanUrls : [],
      priority, collection_id: collectionId || undefined
    };

    const isMissingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMissingEnv) {
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProd } : p));
      } else {
        setProducts([{ ...newProd, id: Math.random().toString() }, ...products]);
      }
      setIsModalOpen(false);
      return;
    }

    try {
      if (editingProduct) {
        await supabase.from("products").update(newProd).eq("id", editingProduct.id);
      } else {
        await supabase.from("products").insert([newProd]);
      }
      const { data } = await supabase.from("products").select("*").order("priority", { ascending: false });
      if (data) setProducts(data as Product[]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
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

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-stone-500">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={24} />
        <span className="text-[10px] uppercase tracking-widest font-mono">Syncing Catalog Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 selection:bg-amber-500 selection:text-black">
      {/* CMS Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-stone-850">
        <div>
          <h2 className="text-3xl font-serif font-light text-white tracking-wide">Products</h2>
          <p className="text-[11px] text-stone-500 uppercase tracking-widest mt-2 font-mono">
            {products.length} Items in Master Catalog
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="px-4 py-2.5 rounded-lg border border-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors hidden sm:block">
            Export CSV
          </button>
          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-5 py-2.5 rounded-lg font-medium text-xs uppercase tracking-wider transition-all duration-300"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input 
            type="text" 
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900/50 border border-stone-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none focus:border-amber-500/50 focus:bg-stone-900 transition-all font-light"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors">
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Professional Data Table */}
      <div className="bg-stone-900/20 border border-stone-850 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300 border-collapse">
            <thead>
              <tr className="bg-stone-900/50 border-b border-stone-850">
                <th className="py-4 px-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-stone-950 border-stone-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Product</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Status</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Inventory</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium">Category</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-stone-500 font-medium text-right">Price</th>
                <th className="py-4 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850/50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-850/30 transition-colors group">
                  <td className="py-3 px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="rounded bg-stone-950 border-stone-700 text-amber-500 focus:ring-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-stone-950 border border-stone-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image_urls[0] ? (
                          <img src={product.image_urls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-stone-700" />
                        )}
                      </div>
                      <div>
                        <button 
                          onClick={() => openEditModal(product)} 
                          className="font-medium text-stone-200 hover:text-amber-500 transition-colors text-sm"
                        >
                          {product.title}
                        </button>
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5">/{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border
                      ${product.in_stock ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-stone-800/50 text-stone-500 border-stone-700"}
                    `}>
                      {product.in_stock ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs ${product.inventory_count === 0 ? "text-red-400" : "text-stone-400"}`}>
                      {product.inventory_count} in stock
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-stone-900 px-2 py-1 rounded text-[10px] text-stone-400 border border-stone-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(product)} className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-stone-500 text-sm font-light">
              No products found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Modern Slide-over Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-stone-900 border-l border-stone-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone-850 bg-stone-950/50">
              <div>
                <h3 className="text-xl font-serif font-light text-white">
                  {editingProduct ? "Edit Product" : "New Product"}
                </h3>
                {editingProduct && <p className="text-[10px] font-mono text-stone-500 uppercase mt-1 tracking-widest">{editingProduct.id}</p>}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-500 hover:text-white rounded-full hover:bg-stone-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Title & Description */}
              <div className="space-y-5">
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-mono border-b border-stone-850 pb-2">Basic Info</h4>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">Title *</label>
                  <input
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-light text-sm text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">Description</label>
                  <textarea
                    rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-3 outline-none focus:border-amber-500 font-light text-sm text-white resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-5">
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-mono border-b border-stone-850 pb-2">Pricing</h4>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-300 mb-2">Price ($) *</label>
                    <input
                      type="number" step="0.01" required value={price} onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-mono text-sm text-white transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-300 mb-2">Compare at price</label>
                    <input
                      type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-mono text-sm text-stone-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory & Organization */}
              <div className="space-y-5">
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-mono border-b border-stone-850 pb-2">Organization & Inventory</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-2">Category *</label>
                    <select
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-light text-sm text-white transition-colors appearance-none"
                    >
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-2">Collection</label>
                    <select
                      value={collectionId} onChange={(e) => setCollectionId(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-light text-sm text-white transition-colors appearance-none"
                    >
                      <option value="">None</option>
                      {collections.map((col) => <option key={col.id} value={col.id}>{col.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-2">Inventory Count</label>
                    <input
                      type="number" value={inventoryCount} onChange={(e) => setInventoryCount(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-mono text-sm text-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-2">Sort Priority</label>
                    <input
                      type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 font-mono text-sm text-white transition-colors"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-stone-800 bg-stone-950 hover:border-amber-500/50 transition-colors">
                    <input
                      type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)}
                      className="rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">Product is active</div>
                      <div className="text-xs text-stone-500 font-light">Uncheck to hide this product from the storefront.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-5 pb-8">
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-mono border-b border-stone-850 pb-2">Media URLs</h4>
                <div>
                  <textarea
                    rows={3} value={imageUrlStr} onChange={(e) => setImageUrlStr(e.target.value)}
                    placeholder="https://image1.jpg, https://image2.jpg"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-3 outline-none focus:border-amber-500 font-mono text-xs text-white resize-none transition-colors"
                  />
                  <p className="text-[10px] text-stone-500 mt-2">Comma separated URLs. The first URL is the primary thumbnail.</p>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-6 border-t border-stone-850 bg-stone-950 flex items-center justify-between">
              {editingProduct ? (
                <button type="button" onClick={() => handleDelete(editingProduct.id)} className="text-xs font-medium text-red-500 hover:text-red-400 transition-colors">
                  Archive Product
                </button>
              ) : <div></div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300">
                  <Check size={14} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
