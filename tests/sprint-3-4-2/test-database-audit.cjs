/**
 * Sprint 3.4.2 - Homologação Operacional
 * Fase 9: Auditoria de Banco de Dados
 * 
 * Validação de:
 * - Estrutura das tabelas
 * - Relacionamentos e FKs
 * - Integridade de dados
 * - Protocolos únicos
 */

const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const REPORT_FILE = './fase9-auditoria-banco-report.md';

class DatabaseAuditor {
  constructor() {
    this.results = {
      startTime: new Date().toISOString(),
      checks: [],
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: []
    };
    this.db = null;
    this.dbType = null;
  }

  log(check, status, details = '') {
    const entry = { check, status, details };
    this.results.checks.push(entry);
    
    if (status === 'PASS') this.results.passed++;
    else if (status === 'FAIL') this.results.failed++;
    else if (status === 'WARN') this.results.warnings++;

    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${check}${details ? ': ' + details : ''}`);
  }

  async connect() {
    console.log('🔌 Conectando ao banco de dados...');
    
    // Tentar SQLite primeiro (desenvolvimento)
    try {
      const dbPath = './database.sqlite';
      if (fs.existsSync(dbPath)) {
        this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
        this.dbType = 'sqlite';
        this.log('Conexão SQLite', 'PASS', `Banco: ${dbPath}`);
        return;
      }
    } catch (e) {
      // Ignorar e tentar PostgreSQL
    }

    // Tentar PostgreSQL
    try {
      this.db = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'elilon_advocacia_db',
        user: process.env.DB_USER || 'elilon_db_user',
        password: process.env.DB_PASSWORD || '',
      });
      this.dbType = 'postgres';
      this.log('Conexão PostgreSQL', 'PASS');
    } catch (error) {
      this.log('Conexão', 'FAIL', error.message);
      throw error;
    }
  }

  async runQuery(query) {
    if (this.dbType === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    } else {
      const result = await this.db.query(query);
      return result.rows;
    }
  }

  async runAllChecks() {
    console.log('='.repeat(70));
    console.log('FASE 9 - AUDITORIA DE BANCO DE DADOS');
    console.log('='.repeat(70));

    await this.connect();

    // Verificar existência das tabelas
    await this.checkTableStructure();
    
    // Verificar dados
    await this.checkDataIntegrity();
    
    // Verificar protocolos
    await this.checkProtocolUniqueness();
    
    // Verificar relacionamentos
    await this.checkRelationships();
    
    // Gerar relatório
    await this.generateReport();

    // Fechar conexão
    if (this.dbType === 'sqlite') {
      this.db.close();
    } else {
      await this.db.end();
    }
  }

  async checkTableStructure() {
    console.log('\n📍 Verificando estrutura das tabelas...');
    
    const requiredTables = ['chat_pre_atendimentos', 'chat_documents'];
    
    for (const table of requiredTables) {
      try {
        let result;
        if (this.dbType === 'sqlite') {
          result = await this.runQuery(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`);
        } else {
          result = await this.runQuery(`SELECT tablename FROM pg_tables WHERE tablename = '${table}'`);
        }
        
        if (result && result.length > 0) {
          this.log(`Tabela ${table}`, 'PASS', 'Existe');
          
          // Verificar colunas
          await this.checkTableColumns(table);
        } else {
          this.log(`Tabela ${table}`, 'FAIL', 'Não encontrada');
        }
      } catch (error) {
        this.log(`Tabela ${table}`, 'FAIL', error.message);
      }
    }
  }

  async checkTableColumns(tableName) {
    try {
      let columns;
      if (this.dbType === 'sqlite') {
        columns = await this.runQuery(`PRAGMA table_info(${tableName})`);
      } else {
        columns = await this.runQuery(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}'
        `);
      }
      
      const requiredColumns = tableName === 'chat_pre_atendimentos' 
        ? ['id', 'protocolo', 'nome', 'email', 'telefone', 'cidade', 'estado', 'area', 'subarea', 'descricao', 'status', 'created_at']
        : ['id', 'pre_atendimento_id', 'filename', 'original_name', 'mime_type', 'size', 'path', 'created_at'];
      
      const foundColumns = columns.map(c => this.dbType === 'sqlite' ? c.name : c.column_name);
      const missingColumns = requiredColumns.filter(c => !foundColumns.includes(c));
      
      if (missingColumns.length === 0) {
        this.log(`Colunas ${tableName}`, 'PASS', `${foundColumns.length} colunas encontradas`);
      } else {
        this.log(`Colunas ${tableName}`, 'WARN', `Faltando: ${missingColumns.join(', ')}`);
      }
    } catch (error) {
      this.log(`Colunas ${tableName}`, 'FAIL', error.message);
    }
  }

  async checkDataIntegrity() {
    console.log('\n📍 Verificando integridade dos dados...');
    
    // Contar registros
    try {
      const preAtendimentos = await this.runQuery('SELECT COUNT(*) as count FROM chat_pre_atendimentos');
      const count = this.dbType === 'sqlite' ? preAtendimentos[0].count : preAtendimentos[0].count;
      this.log('Contagem pré-atendimentos', 'PASS', `${count} registros`);
      
      const documentos = await this.runQuery('SELECT COUNT(*) as count FROM chat_documents');
      const docCount = this.dbType === 'sqlite' ? documentos[0].count : documentos[0].count;
      this.log('Contagem documentos', 'PASS', `${docCount} registros`);
    } catch (error) {
      this.log('Contagem', 'FAIL', error.message);
    }

    // Verificar dados obrigatórios
    try {
      const nullChecks = await this.runQuery(`
        SELECT 
          SUM(CASE WHEN nome IS NULL OR nome = '' THEN 1 ELSE 0 END) as null_nomes,
          SUM(CASE WHEN email IS NULL OR email = '' THEN 1 ELSE 0 END) as null_emails,
          SUM(CASE WHEN protocolo IS NULL OR protocolo = '' THEN 1 ELSE 0 END) as null_protocolos
        FROM chat_pre_atendimentos
      `);
      
      const checks = nullChecks[0];
      if (checks.null_nomes === 0 && checks.null_emails === 0 && checks.null_protocolos === 0) {
        this.log('Dados obrigatórios', 'PASS', 'Todos os campos preenchidos');
      } else {
        this.log('Dados obrigatórios', 'WARN', `Nomes: ${checks.null_nomes}, Emails: ${checks.null_emails}, Protocolos: ${checks.null_protocolos}`);
      }
    } catch (error) {
      this.log('Dados obrigatórios', 'FAIL', error.message);
    }
  }

  async checkProtocolUniqueness() {
    console.log('\n📍 Verificando unicidade de protocolos...');
    
    try {
      const duplicates = await this.runQuery(`
        SELECT protocolo, COUNT(*) as count
        FROM chat_pre_atendimentos
        GROUP BY protocolo
        HAVING COUNT(*) > 1
      `);
      
      if (duplicates.length === 0) {
        this.log('Protocolos únicos', 'PASS', 'Nenhum protocolo duplicado');
      } else {
        this.log('Protocolos únicos', 'FAIL', `${duplicates.length} protocolos duplicados`);
        duplicates.forEach(d => {
          this.results.issues.push(`Protocolo duplicado: ${d.protocolo} (${d.count}x)`);
        });
      }
    } catch (error) {
      this.log('Protocolos únicos', 'FAIL', error.message);
    }
  }

  async checkRelationships() {
    console.log('\n📍 Verificando relacionamentos...');
    
    // Verificar documentos órfãos (com pre_atendimento_id inexistente)
    try {
      const orphans = await this.runQuery(`
        SELECT d.id, d.pre_atendimento_id
        FROM chat_documents d
        LEFT JOIN chat_pre_atendimentos p ON d.pre_atendimento_id = p.id
        WHERE p.id IS NULL
      `);
      
      if (orphans.length === 0) {
        this.log('Documentos órfãos', 'PASS', 'Nenhum documento órfão');
      } else {
        this.log('Documentos órfãos', 'WARN', `${orphans.length} documentos sem pré-atendimento`);
      }
    } catch (error) {
      this.log('Relacionamentos', 'FAIL', error.message);
    }

    // Verificar FKs em SQLite
    if (this.dbType === 'sqlite') {
      try {
        const fkCheck = await this.runQuery('PRAGMA foreign_key_list(chat_documents)');
        if (fkCheck && fkCheck.length > 0) {
          this.log('Foreign Keys SQLite', 'PASS', `${fkCheck.length} FK(s) definida(s)`);
        } else {
          this.log('Foreign Keys SQLite', 'WARN', 'Nenhuma FK explícita (verificar na aplicação)');
        }
      } catch (error) {
        this.log('Foreign Keys', 'INFO', 'Verificação não aplicável');
      }
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO DA AUDITORIA');
    console.log('='.repeat(70));
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    
    console.log(`Total de verificações: ${total}`);
    console.log(`✅ Passaram: ${this.results.passed}`);
    console.log(`❌ Falharam: ${this.results.failed}`);
    console.log(`⚠️ Avisos: ${this.results.warnings}`);

    const report = `# Fase 9 - Auditoria de Banco de Dados

## Resumo
- **Data**: ${this.results.startTime}
- **Tipo de Banco**: ${this.dbType?.toUpperCase() || 'N/A'}
- **Total de verificações**: ${total}
- **✅ Passaram**: ${this.results.passed}
- **❌ Falharam**: ${this.results.failed}
- **⚠️ Avisos**: ${this.results.warnings}

## Verificações Realizadas

${this.results.checks.map(c => `- **${c.check}**: ${c.status}${c.details ? ` (${c.details})` : ''}`).join('\n')}

## Problemas Encontrados
${this.results.issues.length > 0 
  ? this.results.issues.map(i => `- ${i}`).join('\n') 
  : 'Nenhum problema crítico encontrado.'}

## Tabelas Auditadas

### chat_pre_atendimentos
- **Status**: ${this.results.checks.find(c => c.check === 'Tabela chat_pre_atendimentos')?.status || 'N/A'}
- **Campos obrigatórios**: id, protocolo, nome, email, telefone, cidade, estado, area, subarea, descricao, status, created_at

### chat_documents
- **Status**: ${this.results.checks.find(c => c.check === 'Tabela chat_documents')?.status || 'N/A'}
- **Campos obrigatórios**: id, pre_atendimento_id, filename, original_name, mime_type, size, path, created_at

## Conclusão
${this.results.failed === 0 
  ? `✅ Banco de dados validado com sucesso.${this.results.warnings > 0 ? ' Atenção aos avisos.' : ''}` 
  : `🔴 ${this.results.failed} problema(s) crítico(s) encontrado(s). Requer correção antes da produção.`}

## Recomendações
${this.generateRecommendations()}
`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`\n📄 Relatório salvo em: ${REPORT_FILE}`);
  }

  generateRecommendations() {
    const recs = [];
    
    if (this.dbType === 'sqlite') {
      recs.push('- Migrar para PostgreSQL em produção para melhor performance e concorrência');
    }
    
    if (this.results.warnings > 0) {
      recs.push('- Revisar campos opcionais e definir valores padrão onde apropriado');
    }
    
    if (this.results.checks.find(c => c.check === 'Documentos órfãos')?.status === 'WARN') {
      recs.push('- Implementar CASCADE DELETE ou rotina de limpeza de documentos órfãos');
    }
    
    recs.push('- Configurar backups automáticos diários');
    recs.push('- Monitorar crescimento da tabela de documentos (armazenamento)');
    
    return recs.length > 0 ? recs.join('\n') : 'Nenhuma recomendação adicional.';
  }
}

const auditor = new DatabaseAuditor();
auditor.runAllChecks().catch(err => {
  console.error('Erro na auditoria:', err);
  process.exit(1);
});
