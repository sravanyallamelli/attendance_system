import express from "express";
import { createServer as createViteServer } from "vite";
import sqlite3 from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3("attendance.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mobile TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    designation TEXT,
    department TEXT,
    join_date DATE,
    address TEXT,
    role TEXT DEFAULT 'staff',
    status TEXT DEFAULT 'active',
    salary REAL DEFAULT 0,
    total_leaves INTEGER DEFAULT 20,
    password TEXT
  );
`);

// Migration: Add password column if it doesn't exist
const tableInfo = db.prepare("PRAGMA table_info(users)").all();
const hasPasswordColumn = tableInfo.some((col: any) => col.name === 'password');
if (!hasPasswordColumn) {
  try {
    db.exec("ALTER TABLE users ADD COLUMN password TEXT");
    console.log("Migration: Added password column to users table");
  } catch (e) {
    console.error("Migration failed:", e);
  }
}

const hasSalaryColumn = tableInfo.some((col: any) => col.name === 'salary');
if (!hasSalaryColumn) {
  try {
    db.exec("ALTER TABLE users ADD COLUMN salary REAL DEFAULT 0");
    console.log("Migration: Added salary column to users table");
  } catch (e) {
    console.error("Migration failed:", e);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS reset_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    lat REAL,
    lng REAL,
    photo TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    attachment TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'public'
  );

  CREATE TABLE IF NOT EXISTS payslips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    pdf_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed Admin
const adminMobile = '7095011268';
const admin = db.prepare('SELECT * FROM users WHERE mobile = ?').get(adminMobile);
if (!admin) {
  db.prepare('INSERT INTO users (mobile, name, role, password) VALUES (?, ?, ?, ?)').run(adminMobile, 'Admin', 'admin', 'admin123');
} else if (!admin.password) {
  db.prepare('UPDATE users SET password = ? WHERE mobile = ?').run('admin123', adminMobile);
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Auth Middleware
  const checkAdmin = (req: any, res: any, next: any) => {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) return res.status(401).json({ error: 'Unauthorized' });
    const user: any = db.prepare('SELECT role FROM users WHERE id = ?').get(requesterId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // API Routes
  app.post("/api/login", (req, res) => {
    const { mobile, password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user: any = db.prepare("SELECT * FROM users WHERE mobile = ? AND status = 'active'").get(mobile);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Record Login Session
    db.prepare("INSERT INTO user_sessions (user_id, type) VALUES (?, 'LOGIN')").run(user.id);

    res.json(user);
  });

  app.post("/api/logout", (req, res) => {
    const { userId } = req.body;
    if (userId) {
      db.prepare("INSERT INTO user_sessions (user_id, type) VALUES (?, 'LOGOUT')").run(userId);
    }
    res.json({ success: true });
  });

  app.post("/api/forgot-password", (req, res) => {
    const { mobile, email } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE mobile = ? AND email = ?").get(mobile, email);
    
    if (!user) {
      return res.status(404).json({ error: "User not found with these details" });
    }

    res.json({ success: true, userId: user.id });
  });

  app.post("/api/reset-password", (req, res) => {
    const { userId, newPassword } = req.body;
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, userId);
    res.json({ success: true });
  });

  app.get("/api/admin/staff", checkAdmin, (req, res) => {
    const staff = db.prepare("SELECT * FROM users WHERE role = 'staff'").all();
    res.json(staff);
  });

  app.post("/api/admin/staff", checkAdmin, (req, res) => {
    const { mobile, name, email, designation, department, join_date, address, salary, password } = req.body;
    const salaryNum = parseFloat(salary) || 0;
    try {
      db.prepare(`
        INSERT INTO users (mobile, name, email, designation, department, join_date, address, role, salary, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'staff', ?, ?)
      `).run(mobile, name, email, designation, department, join_date, address, salaryNum, password);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Mobile already exists" });
    }
  });

  app.put("/api/admin/staff/:id", checkAdmin, (req, res) => {
    const { mobile, name, email, designation, department, join_date, address, salary, password } = req.body;
    const salaryNum = parseFloat(salary) || 0;
    console.log("Updating staff:", { id: req.params.id, mobile, name, salaryNum });
    try {
      const result = db.prepare(`
        UPDATE users 
        SET mobile = ?, name = ?, email = ?, designation = ?, department = ?, join_date = ?, address = ?, salary = ?, password = ?
        WHERE id = ? AND role = 'staff'
      `).run(mobile, name, email, designation, department, join_date, address, salaryNum, password, req.params.id);
      
      console.log("Update result:", result);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Staff member not found or no changes made" });
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error("Update error:", e);
      res.status(400).json({ error: e.message || "Mobile already exists or update failed" });
    }
  });

  app.patch("/api/admin/staff/:id/status", checkAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/staff/:id", checkAdmin, (req, res) => {
    const id = req.params.id;
    db.prepare("DELETE FROM attendance WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM leaves WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM payslips WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM users WHERE id = ? AND role = 'staff'").run(id);
    res.json({ success: true });
  });

  app.post("/api/attendance", (req, res) => {
    const { mobile, type, lat, lng, photo } = req.body;
    const user: any = db.prepare("SELECT id FROM users WHERE mobile = ?").get(mobile);
    if (!user) return res.status(404).json({ error: "User not found" });
    db.prepare("INSERT INTO attendance (user_id, type, lat, lng, photo) VALUES (?, ?, ?, ?, ?)").run(user.id, type, lat, lng, photo);
    res.json({ success: true });
  });

  app.get("/api/attendance/:type/:userId", (req, res) => {
    const { type, userId } = req.params;
    const dateStr = type === 'today' ? "date('now', 'localtime')" : "date('now', 'localtime', '-1 day')";
    const records = db.prepare(`
      SELECT * FROM (
        SELECT id, user_id, type, timestamp, lat, lng, photo FROM attendance 
        WHERE user_id = ? 
        AND date(timestamp) = ${dateStr}
        UNION ALL
        SELECT id, user_id, type, timestamp, NULL as lat, NULL as lng, NULL as photo FROM user_sessions
        WHERE user_id = ?
        AND date(timestamp) = ${dateStr}
      ) as combined
      ORDER BY timestamp DESC
    `).all(userId, userId);
    res.json(records);
  });

  app.get("/api/admin/reports", checkAdmin, (req, res) => {
    const { staffId, filter } = req.query;
    
    let conditions: string[] = [];
    const params: any[] = [];

    if (staffId && staffId !== 'all') {
      conditions.push("user_id = ?");
      params.push(staffId);
    }

    if (filter === 'today') conditions.push("date(timestamp) = date('now', 'localtime')");
    else if (filter === 'month') conditions.push("date(timestamp) >= date('now', 'start of month')");
    else conditions.push("date(timestamp) >= date('now', '-30 days')");

    const conditionStr = conditions.length ? " WHERE " + conditions.join(" AND ") : "";

    let query = `
      SELECT * FROM (
        SELECT a.id, a.user_id, a.type, a.timestamp, a.lat, a.lng, a.photo, u.name, u.mobile 
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        UNION ALL
        SELECT s.id, s.user_id, s.type, s.timestamp, NULL as lat, NULL as lng, NULL as photo, u.name, u.mobile
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
      ) as combined
      ${conditionStr}
      ORDER BY timestamp DESC
    `;

    res.json(db.prepare(query).all(...params));
  });

  app.get("/api/leaves/:userId", (req, res) => {
    const leaves = db.prepare("SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(leaves);
  });

  app.post("/api/leaves", (req, res) => {
    const { user_id, type, start_date, end_date, reason, attachment } = req.body;
    db.prepare("INSERT INTO leaves (user_id, type, start_date, end_date, reason, attachment) VALUES (?, ?, ?, ?, ?, ?)").run(user_id, type, start_date, end_date, reason, attachment);
    res.json({ success: true });
  });

  app.get("/api/admin/leaves", checkAdmin, (req, res) => {
    const leaves = db.prepare(`
      SELECT l.*, u.name, u.mobile 
      FROM leaves l 
      JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC
    `).all();
    res.json(leaves);
  });

  app.patch("/api/admin/leaves/:id", checkAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE leaves SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/holidays", (req, res) => {
    const holidays = db.prepare("SELECT * FROM holidays ORDER BY date ASC").all();
    res.json(holidays);
  });

  app.post("/api/admin/holidays", checkAdmin, (req, res) => {
    const { date, name, type } = req.body;
    try {
      db.prepare("INSERT INTO holidays (date, name, type) VALUES (?, ?, ?)").run(date, name, type);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Holiday already exists" });
    }
  });

  app.delete("/api/admin/holidays/:id", checkAdmin, (req, res) => {
    db.prepare("DELETE FROM holidays WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/summary", checkAdmin, (req, res) => {
    const allStaff = db.prepare("SELECT * FROM users WHERE role = 'staff' AND status = 'active'").all();
    const presentToday: any[] = db.prepare(`
      SELECT DISTINCT user_id FROM attendance 
      WHERE date(timestamp) = date('now', 'localtime') AND type = 'IN'
    `).all();
    const onLeaveToday: any[] = db.prepare(`
      SELECT DISTINCT user_id FROM leaves 
      WHERE status = 'approved' 
      AND date('now', 'localtime') BETWEEN date(start_date) AND date(end_date)
    `).all();

    const presentIds = new Set(presentToday.map(r => r.user_id));
    const leaveIds = new Set(onLeaveToday.map(r => r.user_id));

    res.json({
      present: presentIds.size,
      onLeave: leaveIds.size,
      absent: allStaff.length - presentIds.size - leaveIds.size,
      total: allStaff.length,
      presentList: allStaff.filter((s: any) => presentIds.has(s.id)),
      onLeaveList: allStaff.filter((s: any) => leaveIds.has(s.id)),
      absentList: allStaff.filter((s: any) => !presentIds.has(s.id) && !leaveIds.has(s.id))
    });
  });

  app.get("/api/payslips/:userId", (req, res) => {
    const slips = db.prepare("SELECT * FROM payslips WHERE user_id = ? ORDER BY year DESC, month DESC").all(req.params.userId);
    res.json(slips);
  });

  app.post("/api/admin/payslips", checkAdmin, (req, res) => {
    const { user_id, month, year, pdf_url } = req.body;
    db.prepare("INSERT INTO payslips (user_id, month, year, pdf_url) VALUES (?, ?, ?, ?)").run(user_id, month, year, pdf_url);
    res.json({ success: true });
  });

  // Vite Middleware
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

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
