import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const { email_id, subject } = req.query;
    let query = supabase.from("pixel_events").select("*").order("time", { ascending: false });

    if (email_id) query = query.eq("email_id", email_id);
    if (subject) query = query.eq("subject", subject);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
}
