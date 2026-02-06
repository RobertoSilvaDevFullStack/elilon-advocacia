/**
 * Script de diagnóstico de conexão com banco de dados
 * Execute: node test-db.js
 */
require("dotenv").config();
const { Pool } = require("pg");

console.log("===========================================");
console.log("🔍 DIAGNÓSTICO DE CONEXÃO - PostgreSQL");
console.log("===========================================\n");

// Mostrar variáveis de ambiente (sem a senha completa)
console.log("📋 VARIÁVEIS DE AMBIENTE DETECTADAS:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "(não definido)"}`);
console.log(
  `   DATABASE_TYPE: ${process.env.DATABASE_TYPE || "(não definido)"}`,
);
console.log(
  `   DATABASE_URL: ${process.env.DATABASE_URL ? "✓ Definido" : "✗ Não definido"}`,
);
console.log(`   DB_HOST: ${process.env.DB_HOST || "(não definido)"}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || "(não definido)"}`);
console.log(`   DB_USER: ${process.env.DB_USER || "(não definido)"}`);
console.log(
  `   DB_PASSWORD: ${process.env.DB_PASSWORD ? "✓ Definido (" + process.env.DB_PASSWORD.length + " chars)" : "✗ Não definido"}`,
);
console.log(`   DB_NAME: ${process.env.DB_NAME || "(não definido)"}`);
console.log(`   DB_SSL: ${process.env.DB_SSL || "(não definido)"}`);

// Configurar conexão
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:
        process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

console.log("\n📡 CONFIGURAÇÃO DE CONEXÃO:");
console.log(
  `   Usando: ${process.env.DATABASE_URL ? "DATABASE_URL" : "Variáveis individuais"}`,
);
console.log(`   Host: ${dbConfig.host || "(via URL)"}`);
console.log(`   Port: ${dbConfig.port || "(via URL)"}`);
console.log(`   Database: ${dbConfig.database || "(via URL)"}`);
console.log(`   SSL: ${dbConfig.ssl ? "Habilitado" : "Desabilitado"}`);

console.log("\n🔌 TENTANDO CONECTAR...\n");

const pool = new Pool(dbConfig);

pool.connect((err, client, release) => {
  if (err) {
    console.log("❌ ERRO DE CONEXÃO!");
    console.log("===========================================");
    console.log(`   Código: ${err.code || "N/A"}`);
    console.log(`   Mensagem: ${err.message}`);
    console.log(`   Stack: ${err.stack}`);
    console.log("===========================================");

    // Dicas baseadas no erro
    console.log("\n💡 POSSÍVEIS SOLUÇÕES:");
    if (err.message.includes("password")) {
      console.log("   - Verifique se a senha está correta");
      console.log("   - Remova caracteres especiais ou escape-os");
    }
    if (err.message.includes("ECONNREFUSED")) {
      console.log("   - O PostgreSQL está rodando?");
      console.log("   - Verifique se o host e porta estão corretos");
    }
    if (err.message.includes("SSL")) {
      console.log("   - Tente adicionar DB_SSL=true ou DB_SSL=false");
    }
    if (err.message.includes("does not exist")) {
      console.log("   - Verifique o nome do banco de dados");
    }
    if (err.message.includes("authentication")) {
      console.log("   - Usuário ou senha incorretos");
    }

    process.exit(1);
  }

  console.log("✅ CONEXÃO BEM SUCEDIDA!");
  console.log("===========================================");

  // Testar query simples
  client.query("SELECT version()", (err, result) => {
    if (err) {
      console.log("❌ Erro ao executar query:", err.message);
    } else {
      console.log(`   PostgreSQL: ${result.rows[0].version}`);
    }

    // Testar se tabela professionals existe
    client.query(
      "SELECT COUNT(*) as total FROM professionals",
      (err, result) => {
        if (err) {
          console.log(
            `   ⚠️  Tabela 'professionals': NÃO EXISTE ou erro - ${err.message}`,
          );
        } else {
          console.log(
            `   ✓ Tabela 'professionals': ${result.rows[0].total} registros`,
          );
        }

        // Testar se tabela users existe
        client.query("SELECT COUNT(*) as total FROM users", (err, result) => {
          if (err) {
            console.log(
              `   ⚠️  Tabela 'users': NÃO EXISTE ou erro - ${err.message}`,
            );
          } else {
            console.log(
              `   ✓ Tabela 'users': ${result.rows[0].total} registros`,
            );
          }

          console.log("===========================================");
          console.log("\n🎉 Diagnóstico concluído!");

          release();
          pool.end();
          process.exit(0);
        });
      },
    );
  });
});
