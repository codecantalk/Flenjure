require('dotenv').config({ path: '.env.local' });
const { createClient } = require('next-sanity');
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-04-20',
  useCdn: false
});

async function main() {
  const products = await client.fetch(`*[_type == "product"]{
    _id,
    "id": slug.current,
    name,
    price,
    "image": image.asset->url,
    category,
    sizes,
    inStock
  }`);
  console.log(JSON.stringify(products, null, 2));
}
main();
