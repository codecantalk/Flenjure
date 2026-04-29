import { getProducts } from "@/lib/sanity";
import CafeClient from "@/components/cafe/CafeClient";

export const metadata = {
  title: "Le Café | Flenjure",
  description: "Exquisite desserts and munchies for the elevated palette.",
};

export default async function CafePage() {
  const products = await getProducts();
  
  return <CafeClient products={products} />;
}
