import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1] || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('announcements').select('*').limit(1);
  if (error) console.log("Error or no table:", error.message);
  else console.log("Announcements table exists.");
}
run();
