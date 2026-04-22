import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = "2024-04-20";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Use CDN for production fetching
});

// Create an image URL builder
const builder = imageUrlBuilder(client);

// Helper function to resolve Sanity images
export function urlFor(source: any) {
  return builder.image(source);
}

// Function to fetch products
export async function getProducts() {
  // If there are no products in Sanity yet, we will gracefully fallback to empty array
  // We use GROQ query language here
  const query = `*[_type == "product"]{
    _id,
    "id": slug.current,
    title,
    price,
    "image": image.asset->url,
    "hoverImage": hoverImage.asset->url,
    "category": category->title,
    variants
  }`;
  
  try {
    const products = await client.fetch(query);
    return products;
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}
