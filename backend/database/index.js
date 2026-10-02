require("dotenv").config();

// Seleção dinâmica do banco de dados baseado no .env
const isPostgres =
  process.env.DATABASE_TYPE === "postgres" ||
  process.env.DATABASE_TYPE === "postgresql" ||
  Boolean(process.env.DATABASE_URL);

let db;

if (isPostgres) {
  console.log("🔧 Configurando PostgreSQL...");
  db = require("../database-postgres");
} else {
  console.log("🔧 Configurando SQLite para desenvolvimento...");
  db = require("../database");
}

module.exports = db;
