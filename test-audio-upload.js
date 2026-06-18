import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log("Testing audio upload...");
  try {
    const buffer = Buffer.from("test audio content");
    // simulate file.arrayBuffer() by converting buffer to ArrayBuffer
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const { data, error } = await supabase.storage.from("audio").upload("test-audio-arraybuffer.mp3", arrayBuffer, {
      contentType: "audio/mpeg",
      upsert: true
    });
    
    if (error) {
      console.error("Upload Error:", error);
    } else {
      console.log("Upload Success:", data);
    }
  } catch (e) {
    console.error("Exception:", e);
  }
}

testUpload();
