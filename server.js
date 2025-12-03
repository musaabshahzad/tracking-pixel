import express from "express";
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = 3000;

let db;

async function initDB() {
  db = await open({
    filename: "./pixel-tracking.db",
    driver: sqlite3.Database
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


const pixelPath = path.join(process.cwd(), "pixel.png");
const pixel = fs.readFileSync(pixelPath);

app.get("/pixel", async (req, res) => {
  const emailId = req.query.email_id || null;
  const subject = req.query.subject || null;
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const time = new Date().toISOString();

  console.log("Email opened:", { emailId, subject, time, ip, userAgent });

  await db.run(
    `INSERT INTO pixel_events (email_id, subject, ip, user_agent, time)
     VALUES (?, ?, ?, ?, ?)`,
    [emailId, subject, ip, userAgent, time]
  );

  res.setHeader("Content-Type", "image/png");
  res.send(pixel);
});


app.get("/tracks", async (req, res) => {
  const rows = await db.all(`SELECT * FROM pixel_events ORDER BY id DESC`);
  res.json(rows);
});


app.listen(PORT, () => {
  console.log(`Pixel tracker running on port ${PORT}`);
});
