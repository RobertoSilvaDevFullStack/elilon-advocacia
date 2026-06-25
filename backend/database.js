require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const {
  translatePostgresToSqlite,
  normalizeSqliteRow,
} = require("./utils/sqlDialect");

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
      source TEXT DEFAULT 'site',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Sprint 3.7: garantir coluna source em bancos existentes
  sqliteDb.run(`ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'site'`, () => {});

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

  // 7. Chat AI Analysis — Hermes (Sprint 3.5)
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS chat_ai_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pre_atendimento_id INTEGER NOT NULL UNIQUE,
      urgencia TEXT CHECK (urgencia IN ('baixa', 'media', 'alta')),
      complexidade TEXT CHECK (complexidade IN ('baixa', 'media', 'alta')),
      area_confirmada TEXT,
      subarea_confirmada TEXT,
      resumo_executivo TEXT NOT NULL DEFAULT 'Análise em andamento...',
      entidades_detectadas TEXT,
      observacoes TEXT,
      status_analise TEXT NOT NULL DEFAULT 'pendente'
          CHECK (status_analise IN ('pendente', 'processando', 'concluida', 'falha')),
      tempo_processamento_ms INTEGER,
      modelo_ia TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela chat_ai_analysis:', err.message);
    } else {
      console.log("✅ Tabela 'chat_ai_analysis' pronta");
    }
  });

  // 8. Chat Webhook Logs (Sprint 3.9)
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS chat_webhook_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pre_atendimento_id INTEGER NOT NULL,
      evento TEXT NOT NULL DEFAULT 'chat_finalizado',
      url TEXT NOT NULL,
      status_code INTEGER,
      success INTEGER NOT NULL DEFAULT 0,
      response TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ Erro ao criar tabela chat_webhook_logs:', err.message);
    else console.log("✅ Tabela 'chat_webhook_logs' pronta");
  });

  // 9. Hermes Webhook Logs (Sprint 3.10)
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS hermes_webhook_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pre_atendimento_id TEXT NOT NULL,
      evento TEXT NOT NULL DEFAULT 'hermes_analise_concluida',
      url TEXT NOT NULL,
      status_code INTEGER,
      success INTEGER NOT NULL DEFAULT 0,
      response TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ Erro ao criar tabela hermes_webhook_logs:', err.message);
    else console.log("✅ Tabela 'hermes_webhook_logs' pronta");
  });

  // Colunas de webhook tracking em chat_pre_atendimentos (Sprint 3.9)
  sqliteDb.run(`ALTER TABLE chat_pre_atendimentos ADD COLUMN webhook_status TEXT DEFAULT 'pendente'`, () => {});
  sqliteDb.run(`ALTER TABLE chat_pre_atendimentos ADD COLUMN webhook_sent_at DATETIME DEFAULT NULL`, () => {});
  sqliteDb.run(`ALTER TABLE chat_pre_atendimentos ADD COLUMN webhook_attempts INTEGER DEFAULT 0`, () => {});

  // Colunas de webhook tracking em chat_ai_analysis (Sprint 3.10)
  sqliteDb.run(`ALTER TABLE chat_ai_analysis ADD COLUMN hermes_webhook_status TEXT DEFAULT 'pendente'`, () => {});
  sqliteDb.run(`ALTER TABLE chat_ai_analysis ADD COLUMN hermes_webhook_sent_at DATETIME DEFAULT NULL`, () => {});

  // 10. Diagnóstico Tributário Leads (Sprint 3.6 / 3.11)
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS diagnostico_tributario_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      empresa TEXT,
      email TEXT,
      whatsapp TEXT,
      respostas TEXT NOT NULL DEFAULT '{}',
      score INTEGER NOT NULL DEFAULT 0,
      nivel_risco TEXT NOT NULL,
      regime_tributario TEXT,
      valor REAL,
      origem TEXT DEFAULT 'site',
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      status TEXT DEFAULT 'novo',
      responsavel TEXT,
      notas TEXT,
      webhook_enviado INTEGER DEFAULT 0,
      webhook_enviado_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ Erro ao criar diagnostico_tributario_leads:', err.message);
    else console.log("✅ Tabela 'diagnostico_tributario_leads' pronta");
  });

  sqliteDb.run(`ALTER TABLE diagnostico_tributario_leads ADD COLUMN regime_tributario TEXT`, () => {});
  sqliteDb.run(`ALTER TABLE diagnostico_tributario_leads ADD COLUMN valor REAL`, () => {});

  // 11. Diagnóstico Tributário Pedidos Premium (Sprint 3.11)
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS diagnostico_tributario_pedidos (
      id TEXT PRIMARY KEY,
      lead_id INTEGER,
      nome TEXT NOT NULL,
      empresa TEXT,
      email TEXT NOT NULL,
      whatsapp TEXT,
      regime_tributario TEXT NOT NULL,
      valor REAL NOT NULL,
      status_pagamento TEXT NOT NULL DEFAULT 'pendente',
      asaas_customer_id TEXT,
      asaas_payment_id TEXT,
      payment_method TEXT,
      payment_link TEXT,
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ Erro ao criar diagnostico_tributario_pedidos:', err.message);
    else console.log("✅ Tabela 'diagnostico_tributario_pedidos' pronta");
  });

  // 12. Chat Pré-Atendimentos (Sprint 3.2)
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS chat_pre_atendimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocolo TEXT UNIQUE NOT NULL,
      area TEXT NOT NULL,
      subarea TEXT NOT NULL,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT NOT NULL,
      cidade TEXT NOT NULL,
      estado TEXT NOT NULL,
      descricao_caso TEXT NOT NULL,
      status TEXT DEFAULT 'novo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela chat_pre_atendimentos:', err.message);
    } else {
      console.log("✅ Tabela 'chat_pre_atendimentos' pronta");
    }
  });
}

function createDefaultAdmin() {
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!adminPassword) {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ ADMIN_INITIAL_PASSWORD não definido — usuário admin padrão não será criado.");
    }
    return;
  }

  const insert = "INSERT INTO users (username, email, password, role, approved) VALUES (?,?,?,?,?)";
  const hashedPassword = bcrypt.hashSync(adminPassword, 12);

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
      const sqliteSql = translatePostgresToSqlite(sql);
      const trimUpper = sqliteSql.trim().toUpperCase();

      const finishRows = (rows) =>
        resolve({ rows: (rows || []).map(normalizeSqliteRow) });

      // For SELECT queries
      if (trimUpper.startsWith("SELECT")) {
        sqliteDb.all(sqliteSql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            finishRows(rows);
          }
        });
      }
      // For INSERT/UPDATE/DELETE with RETURNING
      else if (sqliteSql.includes("RETURNING")) {
        // SQLite doesn't support RETURNING — execute INSERT then SELECT the row
        const cleanSql = sqliteSql.replace(/RETURNING.*/i, "").trim();

        // Detect which table is being written to extract the row after insert
        const tableMatch = cleanSql.match(/(?:INSERT\s+INTO|UPDATE)\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : null;

        sqliteDb.run(cleanSql, params, function (err) {
          if (err) {
            reject(err);
            return;
          }
          const lastId = this.lastID;
          // Fetch the full row so callers get all columns (protocolo, etc.)
          if (tableName && lastId) {
            sqliteDb.get(`SELECT * FROM ${tableName} WHERE id = ?`, [lastId], (selErr, row) => {
              if (selErr || !row) {
                resolve({ rows: [{ id: lastId }] });
              } else {
                resolve({ rows: [normalizeSqliteRow(row)] });
              }
            });
          } else {
            resolve({ rows: [{ id: lastId }] });
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
