import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncShopify() {
  console.log("Fetching products from flenjure.com...");
  const res = await fetch("https://flenjure.com/products.json?limit=250");
  const data = await res.json();
  const products = data.products;

  console.log(`Found ${products.length} products. Syncing to Supabase...`);

  for (const p of products) {
    const isAvailable = p.variants.some(v => v.available);
    const mapped = {
      title: p.title,
      slug: p.handle,
      description: p.body_html.replace(/<[^>]*>?/gm, '').trim(),
      price: parseFloat(p.variants[0]?.price || 0),
      compare_at_price: p.variants[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null,
      category: p.product_type || 'Apparel', // Fallback to Apparel since some are empty
      in_stock: isAvailable,
      inventory_count: isAvailable ? 100 : 0,
      image_urls: p.images.map(img => img.src),
      priority: 5
    };

    // check if it exists by slug
    const { data: existing } = await supabase.from("products").select("id").eq("slug", p.handle).maybeSingle();

    if (existing) {
      const { error } = await supabase.from("products").update(mapped).eq("id", existing.id);
      if (error) console.error("Error updating", p.title, error);
      else console.log(`Updated ${p.title}`);
    } else {
      const { error } = await supabase.from("products").insert(mapped);
      if (error) console.error("Error inserting", p.title, error);
      else console.log(`Inserted ${p.title}`);
    }
  }
  
  console.log("Sync complete.");
}

syncShopify();
