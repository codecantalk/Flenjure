const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mklfrfhzjiztwtbmjjoe.supabase.co', 'sb_publishable_aJp9ve2WU5r8mLcA9bTUzQ_ZhAjLGNU');

async function check() {
  const { data, error } = await supabase.from('products').select('*');
  console.log("Products count (Anon Key):", data ? data.length : 0);
  if (error) console.error("Error:", error);
}
check();
