-- ====================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO
-- Elilon Lopes Advogados
-- ====================================

-- 1. CRIAR BANCO DE DADOS (execute separado se necessário)
-- CREATE DATABASE elilon_advocacia_db;

-- Conecte-se ao banco 'elilon_advocacia_db' e execute o resto:

-- ====================================
-- 2. TABELAS
-- ====================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Posts (Blog)
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
);

-- Tabela de Profissionais
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
);

-- Tabela de Leads
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
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT
);

-- Tabela de Estatísticas Diárias
CREATE TABLE IF NOT EXISTS daily_stats (
  date DATE PRIMARY KEY,
  visits INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0
);

-- ====================================
-- 3. USUÁRIO ADMIN PADRÃO
-- ====================================

-- Inserir usuário admin (senha: admin123)
-- Hash bcrypt de "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ====================================
-- 4. CONFIRMAÇÃO
-- ====================================

-- Verificar tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar usuário admin criado
SELECT id, username, role, created_at 
FROM users 
WHERE username = 'admin';

-- ====================================
-- IMPORTANTE:
-- ====================================
-- Username: admin
-- Password: admin123
-- ⚠️  ALTERE ESSA SENHA APÓS O PRIMEIRO LOGIN!
