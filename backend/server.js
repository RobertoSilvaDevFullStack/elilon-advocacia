require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === "https://elilonlopesadvogados.com.br") return true;
  if (origin === "https://www.elilonlopesadvogados.com.br") return true;
  // localhost/127.0.0.1 nunca é origem em produção real (Railway), só em dev local
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

// CORS configuration
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
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API Elilon Lopes Advogados is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
