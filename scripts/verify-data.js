const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mklfrfhzjiztwtbmjjoe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbGZyZmh6aml6dHd0Ym1qam9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUwNDIwOSwiZXhwIjoyMDk1MDgwMjA5fQ.gc5zglLYZvMVZ228k9azfyMYuoViY1svZcEXRnd0RBk');

async function check() {
  const { data, error } = await supabase.from('products').select('*');
  console.log("Products count:", data ? data.length : 0);
  if (data) {
    data.slice(0, 10).forEach(p => console.log("-", p.title));
  }
  if (error) console.error(error);
}
check();
