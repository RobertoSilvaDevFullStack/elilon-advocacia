require("dotenv").config();

// Seleção dinâmica do banco de dados baseado no .env
const dbType = process.env.DATABASE_TYPE || "sqlite";

let db;

if (dbType === "postgres" || dbType === "postgresql") {
    console.log("🔧 Configurando PostgreSQL...");
    db = require("../database-postgres");
} else {
    console.log("🔧 Configurando SQLite para desenvolvimento...");
    db = require("../database");
}

module.exports = db;
