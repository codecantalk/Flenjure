import { getProducts } from "@/app/admin/actions";
import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export default async function ShopPage() {
  const dbProducts = await getProducts();
  
  const getSizing = (product: any) => {
    const name = product.title.toLowerCase();
    const category = (product.category || "").toLowerCase();

    if (category.includes("apparel") || name.includes("jersey") || name.includes("tee") || name.includes("hoodie")) {
      return {
        type: "apparel",
        metrics: [
          { size: "XS", width: "17\"", length: "22\"" },
          { size: "S", width: "18\"", length: "23\"" },
          { size: "M", width: "20\"", length: "24\"" },
          { size: "L", width: "22\"", length: "25\"" },
          { size: "XL", width: "24\"", length: "26\"" }
        ]
      };
    }
    if (name.includes("bag packs") || category.includes("packaging")) {
      return {
        type: "packaging",
        metrics: [
          { size: "Standard (3.5g)", width: "3.5\"", length: "5\"" },
          { size: "Large (7g)", width: "4\"", length: "6.5\"" },
          { size: "Ounce (28g)", width: "6\"", length: "9\"" }
        ]
      };
    }
    return {
      type: "one-size",
      metrics: []
    };
  };

  const products = dbProducts.map((p: any) => {
    const sizingData = getSizing(p);
    return {
      id: p.slug, // Use slug as the ID for routing purposes since ShopClient links to /shop/${product.id}
      name: p.title, // ShopClient uses product.name
      slug: p.slug,
      price: `$${p.price.toFixed(2)}`,
      compareAtPrice: p.compare_at_price ? `$${p.compare_at_price.toFixed(2)}` : null,
      image: p.image_urls?.[0] || "https://via.placeholder.com/500", // ShopClient uses product.image
      hoverImage: p.image_urls?.[1] || null,
      category: p.category,
      inStock: p.in_stock,
      sizes: sizingData.type !== 'one-size' ? sizingData.metrics.map((m: any) => m.size) : []
    };
  });
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 dark:bg-stone-950" />}>
      <ShopClient products={products} />
    </Suspense>
  );
}
