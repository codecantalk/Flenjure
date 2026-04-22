import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectId = "nkccolc2";
const dataset = "production";
// Secret write-access token to create documents
const token = "skN4MFrg5YC6UeltOD09t60aSMXbSsJG1ulpRoJs9zMSL0BGqT1e4pUijZplUlRTQWWgq8YiiNZPjMTnlQkixwKlIBKnzrtyG9jIeXxkr2xUXjwY2BTwoYt1OscifAwiU5CbRIrZi1ZPS4UKw3AXg4cH5ne45mGMCmG8otWVcUY6KstP2vtZ";

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-04-20',
  token,
  useCdn: false
});

const uploadImage = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Clean query params off filename
    const urlWithoutQuery = url.split('?')[0];
    const filename = urlWithoutQuery.substring(urlWithoutQuery.lastIndexOf('/') + 1) || "image.jpg";

    const asset = await client.assets.upload('image', buffer, {
      filename: filename
    });

    console.log(`Uploaded image: ${filename}`);
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    };
  } catch (err) {
    console.error(`❌ Image upload failed for ${url}:`, err.message);
    return null;
  }
};

const migrate = async () => {
  console.log("🚀 Starting Flendjure Data Migration to Sanity...");
  
  // Read local products.json
  const dataPath = path.join(__dirname, 'src', 'data', 'products.json');
  let rawData;
  try {
    rawData = fs.readFileSync(dataPath, 'utf8');
  } catch (err) {
    console.error("Could not find src/data/products.json");
    return;
  }

  const { products } = JSON.parse(rawData);
  console.log(`Found ${products.length} products to migrate. Processing...\n`);

  for (const p of products) {
    console.log(`Processing: ${p.title}`);
    
    // Process Images
    const imageUrl = p.images?.[0]?.src || null;
    const hoverUrl = p.images?.[1]?.src || null;

    const primaryImageAsset = await uploadImage(imageUrl);
    const hoverImageAsset = await uploadImage(hoverUrl);

    // Extract sizes. Format usually "X Small", "Small", etc from the variants
    // The options array holds the values
    let sizes = [];
    const sizeOption = p.options?.find(o => o.name === "Size" || o.name === "Quantity" || o.name === "Flavor" || o.name === "Title");
    if (sizeOption && sizeOption.values) {
        // filter out 'Default Title'
        sizes = sizeOption.values.filter(val => val !== "Default Title");
    }

    // Determine category based on product type or title heuristically
    let category = "Snacks";
    if (p.title.toLowerCase().includes("jersey")) category = "Apparel";
    if (p.title.toLowerCase().includes("papers") || p.title.toLowerCase().includes("bag pack")) category = "Essentials";

    // Clean price (usually variants[0].price)
    const rawPrice = p.variants?.[0]?.price || "0.00";
    const formattedPrice = `$${rawPrice}`;

    // Clean description html tags
    const cleanDesc = p.body_html.replace(/<[^>]*>?/gm, '').trim();

    const newDoc = {
      _type: "product",
      name: p.title,
      slug: {
        _type: "slug",
        current: p.handle || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      },
      price: formattedPrice,
      description: cleanDesc,
      sizes: sizes,
      category: category,
      image: primaryImageAsset,
      hoverImage: hoverImageAsset
    };

    try {
      const res = await client.create(newDoc);
      console.log(`✅ Passed: ${p.title} -> ${res._id}\n`);
    } catch (err) {
      console.error(`❌ Failed to create product ${p.title}:`, err.message);
    }
  }

  console.log("🏁 Migration Complete!");
};

migrate();
