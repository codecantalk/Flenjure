import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1] || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.storage.createBucket('audio', {
    public: true,
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/x-m4a'],
    fileSizeLimit: 52428800 // 50MB
  });
  console.log("Bucket created:", data);
  if (error) console.error("Error creating bucket:", error);
}

test();
