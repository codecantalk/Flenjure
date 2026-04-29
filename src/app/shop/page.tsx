import { getProducts } from "@/lib/sanity";
import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export default async function ShopPage() {
  const products = await getProducts();
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 dark:bg-stone-950" />}>
      <ShopClient products={products} />
    </Suspense>
  );
}
