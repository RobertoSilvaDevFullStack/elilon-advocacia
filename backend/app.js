require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Proxy Configuration:
// Support TRUST_PROXY env if defined; in production default to 'loopback, linklocal, uniquelocal'
// to safely trust Coolify Traefik and Nginx reverse proxies in Docker networks.
const getTrustProxySetting = () => {
  if (process.env.TRUST_PROXY !== undefined) {
    const val = process.env.TRUST_PROXY.trim();
    if (val === "true") return true;
    if (val === "false") return false;
    const num = Number(val);
    if (!Number.isNaN(num)) return num;
    return val;
  }
  if (process.env.NODE_ENV === "production") {
    return "loopback, linklocal, uniquelocal";
  }
  return false;
};

const trustProxySetting = getTrustProxySetting();
if (trustProxySetting !== false) {
  app.set("trust proxy", trustProxySetting);
}

// CORS Origin Validator
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Postman, curl, server-to-server, same-origin without header

  const originClean = origin.replace(/\/$/, "");

  // Produção padrão
  const staticOrigins = [
    "https://elilonlopesadvogados.com.br",
    "https://www.elilonlopesadvogados.com.br",
  ];
  if (staticOrigins.includes(originClean)) return true;

  // FRONTEND_URL configurado no ambiente
  if (process.env.FRONTEND_URL) {
    const envFrontend = process.env.FRONTEND_URL.trim().replace(/\/$/, "");
    if (originClean === envFrontend) return true;
  }

  // ALLOWED_ORIGINS adicionais (separados por vírgula)
  if (process.env.ALLOWED_ORIGINS) {
    const customOrigins = process.env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean);
    if (customOrigins.includes(originClean)) return true;
  }

  // localhost/127.0.0.1 permitido em desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(originClean)) {
      return true;
    }
  }

  return false;
};

// Manual CORS headers (for direct preflight / legacy clients)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    if (origin && !isAllowedOrigin(origin)) {
      return res.status(403).end();
    }
    return res.status(200).end();
  }
  next();
});

// CORS via cors package: use callback(null, false) for rejected origins instead of throwing error
const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const chatRoutes = require("./src/modules/chat/chat.routes");
const healthController = require("./controllers/healthController");
const { generalApiLimiter } = require("./middleware/rateLimiter");

// Sprint 3.4.3: Health Check Endpoints (fora de /api — sem rate limit global)
app.get("/health", (req, res) => healthController.check(req, res));
app.get("/health/simple", (req, res) => healthController.simpleCheck(req, res));

// Auth com rate limit próprio (authLimiter) — antes do limiter global
app.use("/api/auth", authRoutes);

// Sprint 3.12.2: Rate limit global em /api (webhooks inbound excluídos via skip)
app.use("/api", generalApiLimiter);

// Routes
app.use("/api", apiRoutes);
app.use("/api/chat", chatRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API Elilon Lopes Advogados is running");
});

// Graceful Shutdown
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log(`\n🛑 Recebido sinal ${signal}. Iniciando encerramento gracioso...`);

  // Failsafe timeout de 10 segundos
  const forceExitTimeout = setTimeout(() => {
    console.error("⚠️ Encerramento forçado após timeout de 10s");
    process.exit(1);
  }, 10000);
  if (typeof forceExitTimeout.unref === "function") {
    forceExitTimeout.unref();
  }

  try {
    // 1. Fechar servidor HTTP
    if (server && server.listening) {
      await new Promise((resolve) => {
        server.close((err) => {
          if (err) {
            console.error("❌ Erro ao fechar servidor HTTP:", err.message);
          } else {
            console.log("🔒 Servidor HTTP encerrado com sucesso.");
          }
          resolve();
        });
      });
    }

    // 2. Drenar conexões do banco de dados
    const db = require("./database/index");
    if (db) {
      if (typeof db.end === "function") {
        await db.end();
        console.log("🔒 Pool de conexões do banco drenado.");
      } else if (db.pool && typeof db.pool.end === "function") {
        await db.pool.end();
        console.log("🔒 Pool de conexões do banco drenado.");
      } else if (typeof db.close === "function") {
        await db.close();
        console.log("🔒 Conexão com banco fechada.");
      }
    }

    console.log("👋 Encerramento concluído.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro durante o encerramento gracioso:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

let server;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `❌ Porta ${PORT} já em uso. Encerre o processo anterior ou altere PORT no .env`
      );
    } else {
      console.error("❌ Erro ao iniciar servidor:", err.message);
    }
    process.exit(1);
  });
}

app.server = server;
app.gracefulShutdown = gracefulShutdown;
app.isAllowedOrigin = isAllowedOrigin;
app.getTrustProxySetting = getTrustProxySetting;

module.exports = app;
