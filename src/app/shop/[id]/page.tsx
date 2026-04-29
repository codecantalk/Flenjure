import { getProductById, getProducts } from "@/lib/sanity";
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

    // Determine niche-specific details based on category or name
    const getDetails = (product: any) => {
      const name = product.name.toLowerCase();
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
      const name = product.name.toLowerCase();
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
      .slice(0, 2);

    const mappedProductData = {
      ...productData,
      images: [productData?.image, productData?.hoverImage].filter(Boolean),
      details: getDetails(productData),
      sizing: getSizing(productData),
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
