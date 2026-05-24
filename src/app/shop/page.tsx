import { getProducts } from "@/app/admin/actions";
import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export default async function ShopPage() {
  const dbProducts = await getProducts();
  
  // Transform DB products to match frontend expectations
  const products = dbProducts.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug?.current || p.slug,
    price: `$${p.price.toFixed(2)}`,
    compareAtPrice: p.compare_at_price ? `$${p.compare_at_price.toFixed(2)}` : null,
    imageUrl: p.image_urls?.[0] || "https://via.placeholder.com/500",
    category: p.category,
    inStock: p.in_stock,
  }));
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 dark:bg-stone-950" />}>
      <ShopClient products={products} />
    </Suspense>
  );
}
