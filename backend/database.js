const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

// Connect to SQLite database
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // 1. Users Table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'editor', -- 'admin' or 'editor'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      createDefaultAdmin
    );

    // 2. Posts Table
    db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            slug TEXT UNIQUE,
            category TEXT,
            image TEXT,
            content TEXT,
            excerpt TEXT,
            author_id INTEGER,
            views INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    // 3. Professionals Table
    db.run(`CREATE TABLE IF NOT EXISTS professionals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            role TEXT,
            oab TEXT,
            area TEXT,
            image TEXT,
            bio TEXT,
            email TEXT,
            linkedin TEXT,
            phone TEXT,
            views INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    // 4. Leads Table
    db.run(`CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            phone TEXT,
            city TEXT,
            interest TEXT,
            message TEXT,
            status TEXT DEFAULT 'Novo', -- 'Novo', 'Em contato', 'Arquivado'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    // 5. Settings / Integration
    db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);

    // 6. Analytics (Daily Visits)
    db.run(`CREATE TABLE IF NOT EXISTS daily_stats (
            date TEXT PRIMARY KEY, -- YYYY-MM-DD
            visits INTEGER DEFAULT 0,
            leads_count INTEGER DEFAULT 0
        )`);
  }
});

function createDefaultAdmin() {
  const insert = "INSERT INTO users (username, password, role) VALUES (?,?,?)";
  const hashedPassword = bcrypt.hashSync("admin123", 10);

  db.get("SELECT * FROM users WHERE username = ?", ["admin"], (err, row) => {
    if (!row) {
      db.run(insert, ["admin", hashedPassword, "admin"]);
      console.log("Default admin user created: admin / admin123");
    }
  });
}

module.exports = db;
