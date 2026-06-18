const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('products').select('*');
  console.log("Products count:", data ? data.length : 0);
  if (data) {
    console.log(data.map(d => ({ id: d.id, title: d.title })).slice(0, 10));
  }
}
run();
