import express from "express";
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// ==============================
// Load 1x1 Pixel
// ==============================
const pixel = fs.readFileSync(path.join(__dirname, "pixel.png"));

// ==============================
// Initialize SQLite DB
// ==============================
let db;
async function initDB() {
  db = await open({
    filename: "./pixel-tracking.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS pixel_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id TEXT,
      subject TEXT,
      ip TEXT,
      user_agent TEXT,
      time TEXT
    )
  `);

  console.log("SQLite DB ready");
}

await initDB();

// ==============================
// Pixel Endpoint
// ==============================
app.get("/pixel", async (req, res) => {
  const emailId = req.query.email_id;
  const subject = req.query.subject || null;
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];
  const time = new Date().toISOString();

  if (!emailId) {
    res.status(400).send("Missing email_id");
    return;
  }

  console.log("Email opened:", { emailId, subject, time, ip, userAgent });

  await db.run(
    `INSERT INTO pixel_events (email_id, subject, ip, user_agent, time)
     VALUES (?, ?, ?, ?, ?)`,
    [emailId, subject, ip, userAgent, time]
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.send(pixel);
});

// ==============================
// Individual Tracking Endpoint
// ==============================
app.get("/tracks/:subject", async (req, res) => {
  const subject = req.params.subject;

  try {
    const rows = await db.all(
      `SELECT * FROM pixel_events WHERE subject = ?`,
      [subject]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// ==============================
// Delete All Tracks
// ==============================
app.get("/delete-tracks", async (req, res) => {
  try {
    await db.run(`DELETE FROM pixel_events`);
    res.json({ success: true, message: "All tracks deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete tracks" });
  }
});

// ==============================
// Retrieve Logs
// ==============================
app.get("/tracks", async (req, res) => {
  const rows = await db.all(`SELECT * FROM pixel_events ORDER BY id DESC`);
  res.json(rows);
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`Tracking pixel server running on port ${PORT}`);
});
