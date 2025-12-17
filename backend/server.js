require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Manual CORS headers - aggressive approach
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://elilonlopesadvogados.com.br",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// CORS configuration - allow frontend domains
const corsOptions = {
  origin: [
    "https://elilonlopesadvogados.com.br",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
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
