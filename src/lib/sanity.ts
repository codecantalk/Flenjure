import { createClient } from "@supabase/supabase-js";

// We'll use the service role key to bypass RLS for server-side fetching
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

// We keep the old urlFor signature so we don't break existing components
export function urlFor(source: any) {
  // Our new products just store the raw URL string, so we return it directly
  if (typeof source === "string") return { url: () => source };
  // Fallback for unexpected cases
  return { url: () => "https://via.placeholder.com/500" };
}

export async function getProducts() {
  try {
    const { data: dbProducts, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("in_stock", true) // only fetch active products for storefront
      .order("priority", { ascending: false });

    if (error) {
      console.error("Error fetching products from Supabase:", error);
      return [];
    }

    // Map Supabase schema to the old Sanity schema expected by the frontend
    return (dbProducts || []).map((p: any) => ({
      _id: p.id,
      id: p.slug,
      name: p.title,
      price: typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : (p.price.toString().startsWith('$') ? p.price : `$${p.price}`),
      description: p.description,
      image: p.image_urls?.[0] || null,
      hoverImage: p.image_urls?.[1] || null,
      category: p.category,
      sizes: ["S", "M", "L", "XL"] // default sizes since DB doesn't store them yet
    }));
  } catch (error) {
    console.error("Error formatting products:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    const { data: p, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", id)
      .single();

    if (error || !p) {
      return null;
    }

    return {
      _id: p.id,
      id: p.slug,
      name: p.title,
      price: typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : (p.price.toString().startsWith('$') ? p.price : `$${p.price}`),
      description: p.description,
      image: p.image_urls?.[0] || null,
      hoverImage: p.image_urls?.[1] || null,
      category: p.category,
      sizes: ["S", "M", "L", "XL"]
    };
  } catch (error) {
    console.error(`Error fetching product ${id} from Supabase:`, error);
    return null;
  }
}
