const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) console.error(error);
  console.log(users.map(u => ({ email: u.email, first_name: u.user_metadata?.first_name })));
}
main();
