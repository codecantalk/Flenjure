import { getProductById } from "@/lib/sanity";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { notFound } from "next/navigation";

export default async function ShopProductDetail({ params }: { params: { id: string } }) {
  const productData = await getProductById(params.id);
  
  if (!productData) {
    notFound();
  }

  // Ensure images array structure mirrors the Client Component expectations
  const mappedProductData = {
    ...productData,
    images: [productData.image, productData.hoverImage].filter(Boolean),
    details: [
      "Official Fleñjure Quality",
      "Sourced with care",
      "Imported"
    ]
  };

  return <ProductDetailClient productData={mappedProductData} />;
}
