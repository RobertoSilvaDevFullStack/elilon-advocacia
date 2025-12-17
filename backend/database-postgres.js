require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Testar conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Conectado ao PostgreSQL com sucesso!");
    release();
    initializeDatabase();
  }
});

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Tabela de Usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela 'users' criada");

    // 2. Tabela de Posts (Blog)
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        category VARCHAR(100),
        image TEXT,
        content TEXT,
        excerpt TEXT,
        author_id INTEGER REFERENCES users(id),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela 'posts' criada");

    // 3. Tabela de Profissionais
    await client.query(`
      CREATE TABLE IF NOT EXISTS professionals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        oab VARCHAR(100),
        area VARCHAR(255),
        image TEXT,
        bio TEXT,
        email VARCHAR(255),
        linkedin VARCHAR(500),
        phone VARCHAR(50),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela 'professionals' criada");

    // 4. Tabela de Leads
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        city VARCHAR(255),
        interest VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'Novo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela 'leads' criada");

    // 5. Tabela de Configurações
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT
      )
    `);
    console.log("✅ Tabela 'settings' criada");

    // 6. Tabela de Estatísticas Diárias
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        date DATE PRIMARY KEY,
        visits INTEGER DEFAULT 0,
        leads_count INTEGER DEFAULT 0
      )
    `);
    console.log("✅ Tabela 'daily_stats' criada");

    // Criar usuário admin padrão
    await createDefaultAdmin(client);

    await client.query("COMMIT");
    console.log("\n🎉 Database inicializado com sucesso!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao inicializar database:", error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

async function createDefaultAdmin(client) {
  try {
    const checkUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      ["admin"]
    );

    if (checkUser.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);

      await client.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["admin", hashedPassword, "admin"]
      );

      console.log("\n👤 Usuário admin padrão criado:");
      console.log("   Username: admin");
      console.log("   Password: admin123");
      console.log(
        "   ⚠️  IMPORTANTE: Altere essa senha após o primeiro login!"
      );
    } else {
      console.log("\n👤 Usuário admin já existe no banco");
    }
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin:", error.message);
    throw error;
  }
}

module.exports = pool;
