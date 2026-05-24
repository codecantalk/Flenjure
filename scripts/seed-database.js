import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  console.log("Seeding collections...");
  const mockCollections = [
    {
      name: "Flenjure Core Apparel",
      slug: "flenjure-core-apparel",
      description: "Signature Flenjure pieces engineered for daily comfort and timeless style.",
      image_url: "https://cdn.sanity.io/images/nkccolc2/production/b9eebe9634ca12b2998fe561c0d1afffbcdf0cdc-1500x1500.jpg",
      order: 1
    },
    {
      name: "Accessories & Bags",
      slug: "accessories-bags",
      description: "Premium bags and curated objects from the Flenjure universe.",
      image_url: "https://cdn.sanity.io/images/nkccolc2/production/7b8b4a07f0fb1e5b4b72605f1559edec954d6d67-2000x2000.png",
      order: 2
    },
    {
      name: "Snacks / Munchies",
      slug: "snacks-munchies",
      description: "Curated snacks to fuel the experience.",
      image_url: "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=800",
      order: 3
    }
  ];

  for (const c of mockCollections) {
    const { error } = await supabase.from("collections").insert(c);
    if (error) {
      if (error.code === '23505') {
        console.log(`Collection ${c.name} already exists.`);
      } else {
        console.error("Error inserting collection:", c.name, error.message);
      }
    } else {
      console.log(`Inserted ${c.name}`);
    }
  }

  console.log("Seeding products...");
  const mockProducts = [
    {
      title: "Fleñjure OG Jersey",
      slug: "flenjure-og-jersey",
      description: "Signature Flenjure jersey, standard fit.",
      price: 60.00,
      compare_at_price: 80.00,
      category: "Apparel",
      in_stock: true,
      inventory_count: 50,
      image_urls: ["https://cdn.sanity.io/images/nkccolc2/production/b9eebe9634ca12b2998fe561c0d1afffbcdf0cdc-1500x1500.jpg"],
      priority: 10
    },
    {
      title: "Fleñjure Bag Packs",
      slug: "flenjure-bag-packs",
      description: "Flenjure branded bag packs in multiple sizes.",
      price: 5.00,
      category: "Accessories",
      in_stock: true,
      inventory_count: 100,
      image_urls: ["https://cdn.sanity.io/images/nkccolc2/production/7b8b4a07f0fb1e5b4b72605f1559edec954d6d67-2000x2000.png"],
      priority: 9
    }
  ];

  for (const p of mockProducts) {
    const { error } = await supabase.from("products").insert(p);
    if (error) {
      if (error.code === '23505') {
        console.log(`Product ${p.title} already exists.`);
      } else {
        console.error("Error inserting product:", p.title, error.message);
      }
    } else {
      console.log(`Inserted ${p.title}`);
    }
  }

  console.log("Done seeding.");
}

seed();
