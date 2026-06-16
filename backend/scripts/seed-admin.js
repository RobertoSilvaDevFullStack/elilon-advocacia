/**
 * Sprint 3.4.3 - Fase 3: Seed Admin
 * Script para criar usuário administrador padrão
 * 
 * Uso: npm run seed-admin
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configurações
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@elilon.adv.br';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || generateSecurePassword();

/**
 * Gera senha segura aleatória
 */
function generateSecurePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Conecta ao banco (PostgreSQL ou SQLite)
 */
async function connectDatabase() {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';
  
  if (dbType === 'postgres' || process.env.DATABASE_URL) {
    console.log('🔌 Conectando ao PostgreSQL...');
    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'elilon_advocacia_db',
      user: process.env.DB_USER || 'elilon_db_user',
      password: process.env.DB_PASSWORD || ''
    });
  } else {
    console.log('🔌 Conectando ao SQLite...');
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    return new sqlite3.Database(dbPath);
  }
}

/**
 * Cria tabela de usuários se não existir (SQLite)
 */
async function ensureUsersTable(db, isPostgres) {
  if (isPostgres) {
    // PostgreSQL já deve ter a tabela via migrations
    return;
  }

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  return new Promise((resolve, reject) => {
    db.run(createTableSQL, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Verifica se usuário admin já existe
 */
async function checkAdminExists(db, isPostgres) {
  const query = 'SELECT id, email, created_at FROM users WHERE email = $1 OR email = ?';
  
  if (isPostgres) {
    const result = await db.query(query.replace('?', '$1'), [ADMIN_EMAIL]);
    return result.rows[0];
  } else {
    return new Promise((resolve, reject) => {
      db.get(query, [ADMIN_EMAIL], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

/**
 * Cria usuário admin
 */
async function createAdmin(db, isPostgres) {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  
  const insertSQL = `
    INSERT INTO users (email, password, name, role, approved, created_at)
    VALUES ($1, $2, $3, 'admin', 1, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, created_at
  `;
  
  const insertSQLite = `
    INSERT OR IGNORE INTO users (email, password, name, role, approved, created_at)
    VALUES (?, ?, ?, 'admin', 1, datetime('now'))
  `;

  if (isPostgres) {
    const result = await db.query(insertSQL, [ADMIN_EMAIL, hashedPassword, ADMIN_NAME]);
    return result.rows[0];
  } else {
    return new Promise((resolve, reject) => {
      db.run(insertSQLite, [ADMIN_EMAIL, hashedPassword, ADMIN_NAME], function(err) {
        if (err) reject(err);
        else {
          // Buscar o registro criado
          db.get('SELECT id, email, created_at FROM users WHERE email = ?', [ADMIN_EMAIL], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      });
    });
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Sprint 3.4.3 - Seed Admin');
  console.log('='.repeat(60));
  console.log();

  const isPostgres = process.env.DATABASE_TYPE === 'postgres' || process.env.DATABASE_URL;
  let db;

  try {
    db = await connectDatabase();
    
    // Garantir tabela existe (SQLite)
    if (!isPostgres) {
      await ensureUsersTable(db, isPostgres);
    }

    console.log(`📧 Email do admin: ${ADMIN_EMAIL}`);
    console.log(`👤 Nome: ${ADMIN_NAME}`);
    console.log();

    // Verificar se já existe
    const existing = await checkAdminExists(db, isPostgres);
    
    if (existing) {
      console.log('⚠️  Usuário admin já existe:');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Criado em: ${existing.created_at}`);
      console.log();
      console.log('✅ Nenhuma ação necessária.');
    } else {
      // Criar novo admin
      const newAdmin = await createAdmin(db, isPostgres);
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log();
      console.log('🔐 Credenciais:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Senha: ${ADMIN_PASSWORD}`);
      console.log();
      console.log('⚠️  IMPORTANTE: Salve estas credenciais em local seguro!');
      console.log('   A senha só será exibida uma vez.');
      
      // Salvar em arquivo temporário (opcional)
      const credsFile = path.join(__dirname, '..', 'admin-credentials.txt');
      fs.writeFileSync(credsFile, `Admin Credentials\n================\nEmail: ${ADMIN_EMAIL}\nSenha: ${ADMIN_PASSWORD}\n\nGerado em: ${new Date().toISOString()}\n`);
      console.log();
      console.log(`📝 Credenciais salvas em: ${credsFile}`);
    }

    console.log();
    console.log('='.repeat(60));
    console.log('Processo concluído!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (db) {
      if (isPostgres) {
        await db.end();
      } else {
        db.close();
      }
    }
  }
}

// Executar
main();
