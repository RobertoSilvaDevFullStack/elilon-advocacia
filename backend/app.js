require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Postman, curl, server-to-server
  if (origin === "https://elilonlopesadvogados.com.br") return true;
  if (origin === "https://www.elilonlopesadvogados.com.br") return true;
  // localhost/127.0.0.1 nunca é origem em produção real (Railway), só em dev local
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

// Manual CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// CORS via cors package
const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS bloqueado: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const chatRoutes = require("./src/modules/chat/chat.routes");
const healthController = require("./controllers/healthController");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/chat", chatRoutes);

// Sprint 3.4.3: Health Check Endpoints
app.get("/health", healthController.check);
app.get("/health/simple", healthController.simpleCheck);

// Test Route
app.get("/", (req, res) => {
  res.send("API Elilon Lopes Advogados is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
