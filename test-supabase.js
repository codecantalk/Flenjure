const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mklfrfhzjiztwtbmjjoe.supabase.co',
  'sb_publishable_aJp9ve2WU5r8mLcA9bTUzQ_ZhAjLGNU'
);

async function check() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error fetching products:', error.message);
  } else {
    console.log('Products table exists!', data);
  }
}

check();
