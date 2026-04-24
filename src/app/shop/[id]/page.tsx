import { getProductById } from "@/lib/sanity";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>
};

export default async function ShopProductDetail({ params }: Props) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const productData = await getProductById(decodedId);
    
    if (!productData) {
      return (
        <div className="pt-32 px-12 pb-32">
          <h1>Debug: Sanity returned null</h1>
          <pre>Requested Slug: {id}</pre>
        </div>
      );
    }

    // Ensure images array structure mirrors the Client Component expectations
    const mappedProductData = {
      ...productData,
      images: [productData?.image, productData?.hoverImage].filter(Boolean),
      details: [
        "Official Fleñjure Quality",
        "Sourced with care",
        "Imported"
      ]
    };

    return <ProductDetailClient productData={mappedProductData} />;
  } catch (err: any) {
    return (
      <div className="pt-32 px-12 pb-32">
        <h1>Debug: Server Error occurred</h1>
        <pre>{err.message || String(err)}</pre>
      </div>
    );
  }
}
