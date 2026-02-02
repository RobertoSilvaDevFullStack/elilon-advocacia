require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow frontend domains
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://elilonlopesadvogados.com.br",
      "https://www.elilonlopesadvogados.com.br",
      "http://localhost:3000",
      "http://localhost:5173",
    ];

    // Permitir requests sem origin (Postman, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️ Origin não permitido: ${origin}`);
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
