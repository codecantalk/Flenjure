import { getProducts } from "@/lib/sanity";
import ShopClient from "@/components/shop/ShopClient";

export default async function ShopPage() {
  const products = await getProducts();
  
  return <ShopClient products={products} />;
}
