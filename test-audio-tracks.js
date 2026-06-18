const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // 1. Let's see what is inside the audio_tracks table (select 1 row or see if any exists)
  const { data, error } = await supabase.from('audio_tracks').select('*').limit(5);
  console.log("SELECT audio_tracks data:", data);
  console.log("SELECT audio_tracks error:", error);

  // Let's try inserting a new track
  const newTrack = {
    title: "Test Track " + Date.now(),
    length: "03:45",
    platform_tag: "Spotify",
    track_number: "04",
    audio_url: "https://example.com/test.mp3"
  };
  
  console.log("\nAttempting insert:", newTrack);
  const insertRes = await supabase.from('audio_tracks').insert([newTrack]).select();
  console.log("INSERT audio_tracks data:", insertRes.data);
  console.log("INSERT audio_tracks error:", insertRes.error);
}

run();
