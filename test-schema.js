const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('get_schema_info');
  // Since we don't have rpc for schema, let's just do a generic query or insert with a random string id
  const randomId = "FL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const res = await supabase.from('orders').insert([{
    id: randomId,
    total_amount: 30,
    status: 'paid',
    payment_method: 'stripe',
    payment_status: 'completed',
    email: 'test@example.com',
    items: [{ id: 'prod-1', q: 1 }]
  }]).select().single();
  console.log("With ID - Data:", res.data);
  console.log("With ID - Error:", res.error);
}
run();
