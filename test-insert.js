const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('orders').insert([{
    total_amount: 30,
    status: 'paid',
    payment_method: 'stripe',
    payment_status: 'completed',
    email: 'test@example.com',
    items: [{ id: 'prod-1', q: 1 }]
  }]).select().single();
  console.log("Data:", data);
  console.log("Error:", error);
}
run();
