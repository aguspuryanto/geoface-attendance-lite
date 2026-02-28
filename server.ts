import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("attendance.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'employee', -- 'admin', 'employee'
    face_descriptor TEXT, -- JSON string of face features
    department TEXT,
    base_salary REAL DEFAULT 0,
    shift_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(shift_id) REFERENCES shifts(id)
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    start_time TEXT,
    end_time TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    check_in TEXT,
    check_out TEXT,
    status TEXT, -- 'present', 'late', 'absent', 'leave'
    location_lat REAL,
    location_lng REAL,
    photo_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'cuti', 'sakit', 'izin'
    start_date TEXT,
    end_date TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

try {
  db.exec("ALTER TABLE users ADD COLUMN shift_id INTEGER REFERENCES shifts(id)");
} catch (e) {
  // Column already exists or other error
}

// Seed default admin and settings
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)").run(
    "admin",
    "admin123",
    "Administrator",
    "admin"
  );
}

const defaultRadius = db.prepare("SELECT * FROM settings WHERE key = ?").get("office_radius");
if (!defaultRadius) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("office_radius", "100"); // 100 meters
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("office_lat", "-6.2000");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("office_lng", "106.8166");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, username, full_name, role, department, base_salary FROM users").all();
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { username, password, full_name, role, department, base_salary, shift_id } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (username, password, full_name, role, department, base_salary, shift_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        username, password, full_name, role, department, base_salary, shift_id
      );
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ success: false, message: "Username already exists" });
    }
  });

  app.get("/api/attendance/:userId", (req, res) => {
    const attendance = db.prepare("SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC").all(req.params.userId);
    res.json(attendance);
  });

  app.post("/api/attendance/check-in", (req, res) => {
    const { user_id, date, time, lat, lng, photo } = req.body;
    // Check if already checked in today
    const existing = db.prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?").get(user_id, date);
    if (existing) {
      return res.status(400).json({ success: false, message: "Already checked in today" });
    }
    db.prepare("INSERT INTO attendance (user_id, date, check_in, location_lat, location_lng, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      user_id, date, time, lat, lng, photo, 'present'
    );
    res.json({ success: true });
  });

  app.post("/api/attendance/check-out", (req, res) => {
    const { user_id, date, time } = req.body;
    db.prepare("UPDATE attendance SET check_out = ? WHERE user_id = ? AND date = ?").run(
      time, user_id, date
    );
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const config = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(config);
  });

  app.post("/api/settings", (req, res) => {
    const { office_lat, office_lng, office_radius } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("office_lat", office_lat.toString());
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("office_lng", office_lng.toString());
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("office_radius", office_radius.toString());
    res.json({ success: true });
  });

  app.get("/api/leave/:userId", (req, res) => {
    const leave = db.prepare("SELECT * FROM leave_requests WHERE user_id = ?").all(req.params.userId);
    res.json(leave);
  });

  app.post("/api/leave", (req, res) => {
    const { user_id, type, start_date, end_date, reason } = req.body;
    db.prepare("INSERT INTO leave_requests (user_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)").run(
      user_id, type, start_date, end_date, reason
    );
    res.json({ success: true });
  });

  app.get("/api/reports/summary", (req, res) => {
    const summary = db.prepare(`
      SELECT 
        u.full_name, 
        u.department,
        COUNT(a.id) as days_present,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as days_late
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id
      WHERE u.role = 'employee'
      GROUP BY u.id
    `).all();
    res.json(summary);
  });

  app.get("/api/shifts", (req, res) => {
    const shifts = db.prepare("SELECT * FROM shifts").all();
    res.json(shifts);
  });

  app.post("/api/shifts", (req, res) => {
    const { name, start_time, end_time } = req.body;
    const result = db.prepare("INSERT INTO shifts (name, start_time, end_time) VALUES (?, ?, ?)").run(name, start_time, end_time);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  app.delete("/api/shifts/:id", (req, res) => {
    db.prepare("DELETE FROM shifts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
