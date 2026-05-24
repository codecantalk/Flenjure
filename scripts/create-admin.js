const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mklfrfhzjiztwtbmjjoe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbGZyZmh6aml6dHd0Ym1qam9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUwNDIwOSwiZXhwIjoyMDk1MDgwMjA5fQ.gc5zglLYZvMVZ228k9azfyMYuoViY1svZcEXRnd0RBk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdmin() {
  console.log("Creating admin user...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@flenjure.com',
    password: 'Flenjure2026!',
    email_confirm: true
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("Successfully created user:", data.user.email);
  }
}

createAdmin();
