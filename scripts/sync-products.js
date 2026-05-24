const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mklfrfhzjiztwtbmjjoe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbGZyZmh6aml6dHd0Ym1qam9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUwNDIwOSwiZXhwIjoyMDk1MDgwMjA5fQ.gc5zglLYZvMVZ228k9azfyMYuoViY1svZcEXRnd0RBk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sync() {
  console.log("Fetching Shopify products...");
  const res = await fetch('https://flenjure.com/collections/all/products.json?limit=250');
  const data = await res.json();
  const products = data.products;

  if (!products || products.length === 0) {
    console.error("No products found from the URL.");
    return;
  }

  console.log(`Found ${products.length} products. Syncing to Supabase...`);

  const supabaseProducts = products.map((p, idx) => {
    // Strip HTML from body
    const desc = p.body_html ? p.body_html.replace(/<[^>]*>?/gm, '').trim() : '';
    const variant = p.variants[0] || {};
    
    // Determine category based on title keywords or default to Snack
    let category = "Snacks";
    const titleLower = p.title.toLowerCase();
    if (titleLower.includes("shirt") || titleLower.includes("jersey") || titleLower.includes("hoodie")) {
      category = "Apparel";
    } else if (titleLower.includes("bag") || titleLower.includes("hat")) {
      category = "Accessories";
    }

    return {
      title: p.title,
      slug: p.handle,
      description: desc,
      price: variant.price ? parseFloat(variant.price) : 0,
      compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
      category: category,
      in_stock: variant.available === true,
      inventory_count: variant.available ? 100 : 0, 
      image_urls: p.images.map(img => img.src),
      priority: 100 - idx
    };
  });

  // Try to insert products
  const { data: inserted, error } = await supabase
    .from('products')
    .insert(supabaseProducts)
    .select();

  if (error) {
    console.error("Error inserting products:", error.message);
    if (error.details) console.error("Details:", error.details);
  } else {
    console.log(`Successfully synced ${inserted.length} products to Supabase!`);
  }
}

sync();
