require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Configuração do PostgreSQL
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

const pool = new Pool(dbConfig);

// Testar conexão
if (process.env.NODE_ENV !== "test") {
  pool.connect((err, client, release) => {
    if (err) {
      console.error("❌ Erro ao conectar ao PostgreSQL:", err.message);
      console.log("💡 Dica: Verifique DATABASE_URL no .env");
      console.log(
        "💡 Formato esperado: postgresql://user:password@host:5432/database",
      );
      // Não fazer process.exit(1) para permitir debug
    } else {
      console.log("✅ Conectado ao PostgreSQL com sucesso!");
      release();
      initializeDatabase().catch((initErr) => {
        console.error("❌ Erro na inicialização do schema:", initErr.message);
      });
    }
  });
}

async function initializeDatabase(customClient = null) {
  const client = customClient || (await pool.connect());

  try {
    await client.query("BEGIN");

    // Extensão para geração de UUID
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // 1. Tabela de Usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'editor',
        approved BOOLEAN DEFAULT FALSE,
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
        source VARCHAR(100) DEFAULT 'site',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Sprint 3.7: garantir coluna source em bancos existentes (idempotente)
    await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'site'
    `);
    console.log("✅ Tabela 'leads' criada/atualizada com coluna source");

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

    // 7. Tabela de Leads do Diagnóstico Tributário
    await client.query(`
      CREATE TABLE IF NOT EXISTS diagnostico_tributario_leads (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        empresa VARCHAR(255),
        email VARCHAR(255),
        whatsapp VARCHAR(50),
        respostas JSONB NOT NULL DEFAULT '{}',
        score INTEGER NOT NULL DEFAULT 0,
        nivel_risco VARCHAR(10) NOT NULL CHECK (nivel_risco IN ('alto','medio','baixo')),
        origem VARCHAR(100) DEFAULT 'site',
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        status VARCHAR(50) DEFAULT 'novo',
        responsavel VARCHAR(255),
        notas TEXT,
        webhook_enviado BOOLEAN DEFAULT FALSE,
        webhook_enviado_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela 'diagnostico_tributario_leads' criada");

    // Índices para performance de consultas frequentes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_nivel_risco ON diagnostico_tributario_leads (nivel_risco)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_created_at ON diagnostico_tributario_leads (created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_status ON diagnostico_tributario_leads (status)
    `);

    // Sprint 3.11: colunas premium em leads existentes
    await client.query(`
      ALTER TABLE diagnostico_tributario_leads ADD COLUMN IF NOT EXISTS regime_tributario VARCHAR(50)
    `);
    await client.query(`
      ALTER TABLE diagnostico_tributario_leads ADD COLUMN IF NOT EXISTS valor DECIMAL(10,2)
    `);

    // Sprint 3.11: Pedidos premium (ASAAS)
    await client.query(`
      CREATE TABLE IF NOT EXISTS diagnostico_tributario_pedidos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id INTEGER REFERENCES diagnostico_tributario_leads(id),
        nome VARCHAR(255) NOT NULL,
        empresa VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(50),
        regime_tributario VARCHAR(50) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        status_pagamento VARCHAR(50) NOT NULL DEFAULT 'pendente'
          CHECK (status_pagamento IN ('pendente','aguardando_pagamento','pago','cancelado','expirado')),
        asaas_customer_id VARCHAR(100),
        asaas_payment_id VARCHAR(100),
        payment_method VARCHAR(50),
        payment_link TEXT,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela 'diagnostico_tributario_pedidos' criada");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_pedidos_lead_id ON diagnostico_tributario_pedidos (lead_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_pedidos_status ON diagnostico_tributario_pedidos (status_pagamento)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_pedidos_regime ON diagnostico_tributario_pedidos (regime_tributario)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_pedidos_created_at ON diagnostico_tributario_pedidos (created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diag_pedidos_asaas_payment ON diagnostico_tributario_pedidos (asaas_payment_id)
    `);

    // 8. Tabela de Chat Pré-Atendimentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_pre_atendimentos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        protocolo VARCHAR(100) UNIQUE NOT NULL,
        area VARCHAR(100) NOT NULL,
        subarea VARCHAR(100) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        estado VARCHAR(10) NOT NULL,
        descricao_caso TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'novo',
        webhook_status VARCHAR(50) DEFAULT 'pendente',
        webhook_sent_at TIMESTAMP,
        webhook_attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      ALTER TABLE chat_pre_atendimentos ADD COLUMN IF NOT EXISTS webhook_status VARCHAR(50) DEFAULT 'pendente'
    `);
    await client.query(`
      ALTER TABLE chat_pre_atendimentos ADD COLUMN IF NOT EXISTS webhook_sent_at TIMESTAMP
    `);
    await client.query(`
      ALTER TABLE chat_pre_atendimentos ADD COLUMN IF NOT EXISTS webhook_attempts INTEGER DEFAULT 0
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_protocolo ON chat_pre_atendimentos (protocolo)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_status ON chat_pre_atendimentos (status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_created_at ON chat_pre_atendimentos (created_at)
    `);
    console.log("✅ Tabela 'chat_pre_atendimentos' criada");

    // 9. Tabela de Documentos do Chat
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pre_atendimento_id UUID NOT NULL REFERENCES chat_pre_atendimentos(id) ON DELETE CASCADE,
        original_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        extension VARCHAR(20),
        size_bytes BIGINT,
        mime_type VARCHAR(100),
        storage_path TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_documents_pre_atendimento_id ON chat_documents (pre_atendimento_id)
    `);
    console.log("✅ Tabela 'chat_documents' criada");

    // 10. Tabela de Análises de IA (Hermes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_ai_analysis (
        id SERIAL PRIMARY KEY,
        pre_atendimento_id UUID UNIQUE NOT NULL REFERENCES chat_pre_atendimentos(id) ON DELETE CASCADE,
        urgencia VARCHAR(20) CHECK (urgencia IN ('baixa', 'media', 'alta')),
        complexidade VARCHAR(20) CHECK (complexidade IN ('baixa', 'media', 'alta')),
        area_confirmada VARCHAR(100),
        subarea_confirmada VARCHAR(100),
        resumo_executivo TEXT NOT NULL DEFAULT 'Análise em andamento...',
        entidades_detectadas JSONB DEFAULT '{}',
        observacoes TEXT,
        status_analise VARCHAR(30) NOT NULL DEFAULT 'pendente' 
          CHECK (status_analise IN ('pendente', 'processando', 'concluida', 'falha')),
        tempo_processamento_ms INTEGER,
        modelo_ia VARCHAR(50),
        hermes_webhook_status VARCHAR(50) DEFAULT 'pendente',
        hermes_webhook_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      ALTER TABLE chat_ai_analysis ADD COLUMN IF NOT EXISTS hermes_webhook_status VARCHAR(50) DEFAULT 'pendente'
    `);
    await client.query(`
      ALTER TABLE chat_ai_analysis ADD COLUMN IF NOT EXISTS hermes_webhook_sent_at TIMESTAMP
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_pre_atendimento_id ON chat_ai_analysis (pre_atendimento_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_status ON chat_ai_analysis (status_analise)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_urgencia ON chat_ai_analysis (urgencia)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_complexidade ON chat_ai_analysis (complexidade)
    `);
    console.log("✅ Tabela 'chat_ai_analysis' criada");

    // 11. Tabela de Logs de Webhook do Chat
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_webhook_logs (
        id SERIAL PRIMARY KEY,
        pre_atendimento_id UUID NOT NULL REFERENCES chat_pre_atendimentos(id) ON DELETE CASCADE,
        evento VARCHAR(100) NOT NULL DEFAULT 'chat_finalizado',
        url TEXT NOT NULL,
        status_code INTEGER,
        success BOOLEAN NOT NULL DEFAULT FALSE,
        response TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_webhook_logs_pre_atendimento ON chat_webhook_logs (pre_atendimento_id)
    `);
    console.log("✅ Tabela 'chat_webhook_logs' criada");

    // 12. Tabela de Logs de Webhook do Hermes
    await client.query(`
      CREATE TABLE IF NOT EXISTS hermes_webhook_logs (
        id SERIAL PRIMARY KEY,
        pre_atendimento_id UUID NOT NULL REFERENCES chat_pre_atendimentos(id) ON DELETE CASCADE,
        evento VARCHAR(100) NOT NULL DEFAULT 'hermes_analise_concluida',
        url TEXT NOT NULL,
        status_code INTEGER,
        success BOOLEAN NOT NULL DEFAULT FALSE,
        response TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hermes_webhook_logs_pre_atendimento ON hermes_webhook_logs (pre_atendimento_id)
    `);
    console.log("✅ Tabela 'hermes_webhook_logs' criada");

    // 13. Tabela de Tokens de Recuperação de Senha
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens (token)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens (user_id)
    `);
    console.log("✅ Tabela 'password_reset_tokens' criada");

    // Criar usuário admin padrão
    await createDefaultAdmin(client);

    await client.query("COMMIT");
    console.log("\n🎉 Database inicializado com sucesso!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao inicializar database:", error.message);
    throw error;
  } finally {
    if (typeof client.release === "function") {
      client.release();
    }
    // NÃO chamar pool.end() aqui - isso fecha a conexão para toda a aplicação!
  }
}

async function createDefaultAdmin(client) {
  try {
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (!adminPassword) {
      if (process.env.NODE_ENV === "production") {
        console.warn("⚠️ ADMIN_INITIAL_PASSWORD não definido — usuário admin padrão não será criado.");
      }
      return;
    }

    const checkUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      ["admin"],
    );

    if (checkUser.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync(adminPassword, 12);

      await client.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["admin", hashedPassword, "admin"],
      );

      console.log("\n👤 Usuário admin padrão criado.");
      console.log(
        "   ⚠️  IMPORTANTE: Altere essa senha após o primeiro login!",
      );
    } else {
      console.log("\n👤 Usuário admin já existe no banco");
    }
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin:", error.message);
    throw error;
  }
}

pool.initializeDatabase = initializeDatabase;
module.exports = pool;
