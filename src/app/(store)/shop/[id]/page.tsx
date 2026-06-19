import { getProductBySlug, getProducts } from "@/app/admin/actions";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>
};

export default async function ShopProductDetail({ params }: Props) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const productData = await getProductBySlug(decodedId);
    
    if (!productData) {
      return (
        <div className="pt-32 px-12 pb-32">
          <h1>Debug: Product returned null</h1>
          <pre>Requested Slug: {id}</pre>
        </div>
      );
    }

    // Determine niche-specific details based on category or name
    const getDetails = (product: any) => {
      if (product.description && product.description.trim().length > 0) {
        return product.description.split('\n').filter((line: string) => line.trim().length > 0);
      }
      
      const name = product.title.toLowerCase();
      const category = (product.category || "").toLowerCase();

      if (name.includes("rolling papers")) {
        return [
          "Premium Natural Fibers",
          "Non-Toxic Arabic Gum",
          "Slow Burn Technology",
          "Vegan & Sustainably Sourced"
        ];
      }
      if (name.includes("bag packs") || category.includes("packaging")) {
        return [
          "3.5g Industry Standard Capacity",
          "Premium Mylar Construction",
          "Durable & Light Weight",
          "Sealable for Freshness"
        ];
      }
      if (category.includes("apparel") || name.includes("jersey") || name.includes("tee") || name.includes("hoodie")) {
        return [
          "Heavyweight Premium Cotton",
          "Reinforced Stitching",
          "Pre-shrunk for Perfect Fit",
          "Ethically Manufactured"
        ];
      }
      if (category.includes("snacks")) {
        return [
          "Authentic Flavor Profile",
          "Freshly Sourced",
          "Perfect Pairing for Experiences",
          "Global Favorite"
        ];
      }
      return [
        "Official Fleñjure Quality",
        "Sourced with clinical precision",
        "Imported Luxury Standard"
      ];
    };

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

    const allProducts = await getProducts();
    const relatedProducts = allProducts
      .filter((p: any) => p.id !== productData.id)
      .sort(() => 0.5 - Math.random()) // naive shuffle
      .slice(0, 2)
      .map((p: any) => {
        const sizingData = getSizing(p);
        return {
          id: p.slug,
          name: p.title,
          slug: p.slug,
          price: `$${p.price.toFixed(2)}`,
          compareAtPrice: p.compare_at_price ? `$${p.compare_at_price.toFixed(2)}` : null,
          image: p.image_urls?.[0] || "https://via.placeholder.com/500",
          hoverImage: p.image_urls?.[1] || null,
          category: p.category,
          inStock: p.in_stock,
          sizes: sizingData.type !== 'one-size' ? sizingData.metrics.map((m: any) => m.size) : []
        };
      });

    const sizingData = getSizing(productData);
    
    // Use CMS variants if they exist, otherwise fallback to heuristics
    const hasVariants = productData.variants && productData.variants.length > 0;
    const mappedSizes = hasVariants 
      ? productData.variants.map((v: any) => v.size + (v.color ? ` - ${v.color}` : ''))
      : [];

    const mappedProductData = {
      ...productData,
      name: productData.title,
      price: `$${productData.price.toFixed(2)}`,
      compareAtPrice: productData.compare_at_price ? `$${productData.compare_at_price.toFixed(2)}` : null,
      images: productData.image_urls || ["https://via.placeholder.com/500"],
      details: getDetails(productData),
      sizing: sizingData,
      sizes: mappedSizes,
      variants: productData.variants || [],
      relatedProducts
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
