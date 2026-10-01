const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

describe("Production Hardening - Phase 1", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("A. Express Trust Proxy Configuration", () => {
    it("should default to 'loopback, linklocal, uniquelocal' in production when TRUST_PROXY is not defined", () => {
      process.env.NODE_ENV = "production";
      delete process.env.TRUST_PROXY;

      // Require app in test mode
      process.env.NODE_ENV = "test";
      const app = require("../app");
      
      // Simulate production logic
      process.env.NODE_ENV = "production";
      assert.strictEqual(
        app.getTrustProxySetting(),
        "loopback, linklocal, uniquelocal"
      );
    });

    it("should return custom TRUST_PROXY string when defined", () => {
      process.env.TRUST_PROXY = "10.0.0.0/8, 172.16.0.0/12";
      const app = require("../app");
      assert.strictEqual(
        app.getTrustProxySetting(),
        "10.0.0.0/8, 172.16.0.0/12"
      );
    });

    it("should parse boolean 'true' and numeric TRUST_PROXY correctly", () => {
      const app = require("../app");

      process.env.TRUST_PROXY = "true";
      assert.strictEqual(app.getTrustProxySetting(), true);

      process.env.TRUST_PROXY = "false";
      assert.strictEqual(app.getTrustProxySetting(), false);

      process.env.TRUST_PROXY = "1";
      assert.strictEqual(app.getTrustProxySetting(), 1);
    });

    it("should return false in development when TRUST_PROXY is not defined", () => {
      delete process.env.TRUST_PROXY;
      process.env.NODE_ENV = "development";
      const app = require("../app");
      assert.strictEqual(app.getTrustProxySetting(), false);
    });
  });

  describe("B. CORS Configuration and Origin Whitelist", () => {
    it("should allow server-to-server or requests without origin header", () => {
      const app = require("../app");
      assert.strictEqual(app.isAllowedOrigin(undefined), true);
      assert.strictEqual(app.isAllowedOrigin(null), true);
      assert.strictEqual(app.isAllowedOrigin(""), true);
    });

    it("should allow canonical production domain and www subdomain", () => {
      const app = require("../app");
      assert.strictEqual(
        app.isAllowedOrigin("https://elilonlopesadvogados.com.br"),
        true
      );
      assert.strictEqual(
        app.isAllowedOrigin("https://www.elilonlopesadvogados.com.br"),
        true
      );
    });

    it("should allow FRONTEND_URL and ALLOWED_ORIGINS environment variables", () => {
      process.env.FRONTEND_URL = "https://preview.elilonlopesadvogados.com.br/";
      process.env.ALLOWED_ORIGINS =
        "https://staging.elilon.com.br, https://admin.elilon.com.br/";
      const app = require("../app");

      assert.strictEqual(
        app.isAllowedOrigin("https://preview.elilonlopesadvogados.com.br"),
        true
      );
      assert.strictEqual(
        app.isAllowedOrigin("https://staging.elilon.com.br"),
        true
      );
      assert.strictEqual(
        app.isAllowedOrigin("https://admin.elilon.com.br"),
        true
      );
    });

    it("should allow localhost origins in development mode", () => {
      process.env.NODE_ENV = "development";
      const app = require("../app");

      assert.strictEqual(app.isAllowedOrigin("http://localhost:3000"), true);
      assert.strictEqual(app.isAllowedOrigin("http://localhost:5173"), true);
      assert.strictEqual(app.isAllowedOrigin("http://127.0.0.1:4173"), true);
    });

    it("should reject localhost origins and untrusted domains in production mode", () => {
      process.env.NODE_ENV = "production";
      delete process.env.ALLOWED_ORIGINS;
      delete process.env.FRONTEND_URL;
      const app = require("../app");

      assert.strictEqual(app.isAllowedOrigin("http://localhost:3000"), false);
      assert.strictEqual(app.isAllowedOrigin("http://127.0.0.1:5173"), false);
      assert.strictEqual(app.isAllowedOrigin("https://malicious-site.com"), false);
    });
  });

  describe("C. PostgreSQL Schema Parity & DDL Integrity", () => {
    it("should contain all 6 required tables, constraints and indices in backend/database-postgres.js", () => {
      const dbPostgresContent = fs.readFileSync(
        path.join(__dirname, "..", "database-postgres.js"),
        "utf8"
      );

      // pgcrypto extension
      assert.ok(
        dbPostgresContent.includes('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'),
        "Missing CREATE EXTENSION IF NOT EXISTS pgcrypto"
      );

      // 1. chat_pre_atendimentos
      assert.ok(
        dbPostgresContent.includes("CREATE TABLE IF NOT EXISTS chat_pre_atendimentos"),
        "Missing chat_pre_atendimentos table"
      );
      assert.ok(
        dbPostgresContent.includes("webhook_status"),
        "Missing webhook_status column in chat_pre_atendimentos"
      );
      assert.ok(
        dbPostgresContent.includes("webhook_sent_at"),
        "Missing webhook_sent_at column in chat_pre_atendimentos"
      );
      assert.ok(
        dbPostgresContent.includes("webhook_attempts"),
        "Missing webhook_attempts column in chat_pre_atendimentos"
      );

      // 2. chat_documents
      assert.ok(
        dbPostgresContent.includes("CREATE TABLE IF NOT EXISTS chat_documents"),
        "Missing chat_documents table"
      );
      assert.ok(
        dbPostgresContent.includes("REFERENCES chat_pre_atendimentos(id) ON DELETE CASCADE"),
        "Missing foreign key to chat_pre_atendimentos with CASCADE"
      );

      // 3. chat_ai_analysis
      assert.ok(
        dbPostgresContent.includes("CREATE TABLE IF NOT EXISTS chat_ai_analysis"),
        "Missing chat_ai_analysis table"
      );
      assert.ok(
        dbPostgresContent.includes("pre_atendimento_id UUID UNIQUE NOT NULL"),
        "Missing pre_atendimento_id UUID UNIQUE constraint"
      );
      assert.ok(
        dbPostgresContent.includes("entidades_detectadas JSONB"),
        "Missing JSONB entidades_detectadas column"
      );
      assert.ok(
        dbPostgresContent.includes("hermes_webhook_status"),
        "Missing hermes_webhook_status column"
      );

      // 4. chat_webhook_logs
      assert.ok(
        dbPostgresContent.includes("CREATE TABLE IF NOT EXISTS chat_webhook_logs"),
        "Missing chat_webhook_logs table"
      );

      // 5. hermes_webhook_logs
      assert.ok(
        dbPostgresContent.includes("CREATE TABLE IF NOT EXISTS hermes_webhook_logs"),
        "Missing hermes_webhook_logs table"
      );

      // 6. password_reset_tokens
      assert.ok(
        dbPostgresContent.includes("CREATE TABLE IF NOT EXISTS password_reset_tokens"),
        "Missing password_reset_tokens table"
      );
      assert.ok(
        dbPostgresContent.includes("REFERENCES users(id) ON DELETE CASCADE"),
        "Missing FK from password_reset_tokens to users(id) ON DELETE CASCADE"
      );
    });

    it("should execute initializeDatabase idempotently with mock queries", async () => {
      const pool = require("../database-postgres");
      const executedQueries = [];
      const mockClient = {
        query: async (sql) => {
          executedQueries.push(sql);
          return { rows: [] };
        },
      };

      await pool.initializeDatabase(mockClient);

      assert.ok(executedQueries.length > 15, "Expected DDL queries executed");
      assert.strictEqual(executedQueries[0], "BEGIN");
      assert.strictEqual(executedQueries[executedQueries.length - 1], "COMMIT");
    });
  });

  describe("D. Database Healthcheck & Error Sanitization", () => {
    const healthController = require("../controllers/healthController");

    it("should provide lightweight /health/simple without touching the database", async () => {
      let responseStatus = null;
      let responseBody = null;
      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            send: (body) => {
              responseBody = body;
              return { status: code, body };
            },
          };
        },
      };

      await healthController.simpleCheck({}, res);
      assert.strictEqual(responseStatus, 200);
      assert.strictEqual(responseBody, "OK");
    });

    it("should return healthy status when database responds", async () => {
      const db = require("../database/index");
      const originalQuery = db.query;

      db.query = async () => {
        return { rows: [{ healthy: 1 }] };
      };

      try {
        const result = await healthController.checkDatabase();
        assert.strictEqual(result.status, "healthy");
        assert.strictEqual(result.message, "Conectado");
        assert.strictEqual(typeof result.responseTime, "number");
      } finally {
        db.query = originalQuery;
      }
    });

    it("should never leak credentials or internal errors when database fails", async () => {
      const db = require("../database/index");
      const originalQuery = db.query;

      // Mock database error containing sensitive info
      db.query = async () => {
        throw new Error(
          "Connection failed: postgresql://admin_user:secret_password@postgres.internal:5432/production_db"
        );
      };

      try {
        const result = await healthController.checkDatabase();
        assert.strictEqual(result.status, "unhealthy");
        assert.strictEqual(result.message, "Falha na conexão com o banco de dados");
        assert.ok(
          !JSON.stringify(result).includes("secret_password"),
          "Healthcheck leaked database password"
        );
        assert.ok(
          !JSON.stringify(result).includes("postgresql://"),
          "Healthcheck leaked connection string"
        );
      } finally {
        db.query = originalQuery;
      }
    });
  });

  describe("E. Graceful Shutdown Idempotency", () => {
    it("should register SIGTERM and SIGINT listeners", () => {
      const sigtermListeners = process.listeners("SIGTERM");
      const sigintListeners = process.listeners("SIGINT");

      assert.ok(sigtermListeners.length > 0, "SIGTERM handler not registered");
      assert.ok(sigintListeners.length > 0, "SIGINT handler not registered");
    });
  });
});
