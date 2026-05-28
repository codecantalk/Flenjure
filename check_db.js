const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mklfrfhzjiztwtbmjjoe.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbGZyZmh6aml6dHd0Ym1qam9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUwNDIwOSwiZXhwIjoyMDk1MDgwMjA5fQ.gc5zglLYZvMVZ228k9azfyMYuoViY1svZcEXRnd0RBk";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabaseAdmin.from("products").select("variants").limit(1);
  console.log("Variants column check:", error ? error.message : "Exists!");
}
run();
