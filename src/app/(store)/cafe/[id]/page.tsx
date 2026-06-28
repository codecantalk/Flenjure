import { getCafeItemById, getCafeItems } from "@/app/admin/actions";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>
};

export default async function CafeProductDetail({ params }: Props) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const cafeItemData = await getCafeItemById(decodedId);
    
    if (!cafeItemData || !cafeItemData.in_stock) {
      return (
        <div className="pt-32 px-12 pb-32">
          <h1>Debug: Cafe item returned null</h1>
          <pre>Requested ID: {id}</pre>
        </div>
      );
    }

    // Determine details based on description
    const getDetails = (item: any) => {
      if (item.description && item.description.trim().length > 0) {
        return item.description.split('\n').filter((line: string) => line.trim().length > 0);
      }
      return [
        "Freshly prepared daily",
        "Locally sourced ingredients",
        "Official Fleñjure Cafe Quality"
      ];
    };

    const allCafeItems = await getCafeItems();
    const relatedProducts = allCafeItems
      .filter((p: any) => p.id !== cafeItemData.id && p.in_stock)
      .sort(() => 0.5 - Math.random()) // naive shuffle
      .slice(0, 2)
      .map((p: any) => {
        const hasVariants = p.variants && p.variants.length > 0;
        return {
          id: p.id,
          name: p.name,
          slug: p.id, // we use ID as slug for cafe items
          price: `$${Number(p.price).toFixed(2)}`,
          compareAtPrice: p.compare_at_price ? `$${Number(p.compare_at_price).toFixed(2)}` : null,
          image: p.image_urls?.[0] || p.image || "/images/cafe_placeholder.png",
          hoverImage: p.image_urls?.[1] || null,
          category: p.category,
          inStock: p.in_stock,
          sizes: hasVariants ? p.variants.map((v: any) => v.size + (v.color ? ` - ${v.color}` : '')) : []
        };
      });

    const hasVariants = cafeItemData.variants && cafeItemData.variants.length > 0;
    const mappedSizes = hasVariants 
      ? cafeItemData.variants.map((v: any) => v.size + (v.color ? ` - ${v.color}` : ''))
      : [];

    const mappedProductData = {
      ...cafeItemData,
      title: cafeItemData.name, // in case ProductDetailClient uses title
      name: cafeItemData.name,
      price: `$${Number(cafeItemData.price).toFixed(2)}`,
      compareAtPrice: cafeItemData.compare_at_price ? `$${Number(cafeItemData.compare_at_price).toFixed(2)}` : null,
      images: cafeItemData.image_urls?.length > 0 ? cafeItemData.image_urls : [cafeItemData.image || "/images/cafe_placeholder.png"],
      details: getDetails(cafeItemData),
      sizing: { type: 'one-size', metrics: [] }, // Cafe items don't have sizing tables
      sizes: mappedSizes,
      variants: cafeItemData.variants || [],
      relatedProducts,
      isCafeItem: true
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
