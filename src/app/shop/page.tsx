import { getProducts } from "@/app/admin/actions";
import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export default async function ShopPage() {
  const dbProducts = await getProducts();
  
  const products = dbProducts.map((p: any) => ({
    id: p.slug, // Use slug as the ID for routing purposes since ShopClient links to /shop/${product.id}
    name: p.title, // ShopClient uses product.name
    slug: p.slug,
    price: `$${p.price.toFixed(2)}`,
    compareAtPrice: p.compare_at_price ? `$${p.compare_at_price.toFixed(2)}` : null,
    image: p.image_urls?.[0] || "https://via.placeholder.com/500", // ShopClient uses product.image
    hoverImage: p.image_urls?.[1] || null,
    category: p.category,
    inStock: p.in_stock,
  }));
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 dark:bg-stone-950" />}>
      <ShopClient products={products} />
    </Suspense>
  );
}
