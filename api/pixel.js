import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the 1x1 pixel
const pixel = fs.readFileSync(path.join(__dirname, "../pixel.png"));

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { email_id, subject } = req.query || {};
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const time = new Date().toISOString();

  if (!email_id) {
    res.status(400).send("Missing email_id");
    return;
  }

  try {
    await supabase.from("pixel_events").insert({
      email_id,
      subject: subject || null,
      ip,
      user_agent: userAgent,
      time
    });
  } catch (err) {
    console.error("Supabase insert error:", err);
  }

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.send(pixel);
}
