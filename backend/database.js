require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

// Connect to SQLite database
const sqliteDb = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    console.log("✅ Conectado ao SQLite database.");

    // Initialize tables
    initializeTables();
  }
});

function initializeTables() {
  // 1. Users Table
  sqliteDb.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'editor',
      approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    createDefaultAdmin,
  );

  // 2. Posts Table
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS posts (
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
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS professionals (
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
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      city TEXT,
      interest TEXT,
      message TEXT,
      status TEXT DEFAULT 'Novo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 5. Settings / Integration
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
  )`);

  // 6. Analytics (Daily Visits)
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      visits INTEGER DEFAULT 0,
      leads_count INTEGER DEFAULT 0
  )`);
}

function createDefaultAdmin() {
  const insert = "INSERT INTO users (username, email, password, role, approved) VALUES (?,?,?,?,?)";
  const hashedPassword = bcrypt.hashSync("admin123", 10);

  sqliteDb.get(
    "SELECT * FROM users WHERE username = ?",
    ["admin"],
    (err, row) => {
      if (!row) {
        sqliteDb.run(insert, ["admin", "admin@elilon.com.br", hashedPassword, "superadmin", 1]);
        console.log("👤 Usuário admin padrão criado.");
      } else if (row.approved === null || row.approved === undefined) {
        sqliteDb.run("UPDATE users SET approved = 1 WHERE username = 'admin'");
      }
    },
  );
}

// Create PostgreSQL-compatible API wrapper for SQLite
const db = {
  // Wrap SQLite's all() method to return PostgreSQL-style result
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL placeholders ($1, $2) to SQLite placeholders (?, ?)
      const sqliteSql = sql.replace(/\$(\d+)/g, "?");

      // For SELECT queries
      if (sqliteSql.trim().toUpperCase().startsWith("SELECT")) {
        sqliteDb.all(sqliteSql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            // Return PostgreSQL-style result object
            resolve({ rows: rows || [] });
          }
        });
      }
      // For INSERT/UPDATE/DELETE with RETURNING
      else if (sqliteSql.includes("RETURNING")) {
        // SQLite doesn't support RETURNING, so we need to handle it differently
        const cleanSql = sqliteSql.replace(/RETURNING.*/i, "").trim();

        sqliteDb.run(cleanSql, params, function (err) {
          if (err) {
            reject(err);
          } else {
            // Return the last inserted ID
            resolve({ rows: [{ id: this.lastID }] });
          }
        });
      }
      // For regular INSERT/UPDATE/DELETE
      else {
        sqliteDb.run(sqliteSql, params, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: [], rowCount: this.changes });
          }
        });
      }
    });
  },
};

module.exports = db;
