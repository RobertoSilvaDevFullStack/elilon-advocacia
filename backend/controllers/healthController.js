/**
 * Sprint 3.4.3 - Fase 6: Health Check
 * Endpoint para monitoramento de saúde do sistema
 */

const fs = require('fs');
const path = require('path');
const db = require('../database/index');

class HealthController {
  /**
   * GET /health
   * Retorna status completo da aplicação
   */
  async check(req, res) {
    const checks = {
      timestamp: new Date().toISOString(),
      service: 'elilon-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      status: 'healthy', // healthy, degraded, unhealthy
      uptime: process.uptime(),
      checks: {}
    };

    // 1. Verificar API (sempre OK se chegou aqui)
    checks.checks.api = {
      status: 'healthy',
      responseTime: 'N/A',
      message: 'API respondendo'
    };

    // 2. Verificar banco de dados
    const dbCheck = await this.checkDatabase();
    checks.checks.database = dbCheck;
    if (dbCheck.status !== 'healthy') {
      checks.status = 'degraded';
    }

    // 3. Verificar sistema de arquivos (uploads)
    const fsCheck = this.checkFileSystem();
    checks.checks.filesystem = fsCheck;
    if (fsCheck.status !== 'healthy') {
      checks.status = 'degraded';
    }

    // 4. Verificar memória
    const memoryCheck = this.checkMemory();
    checks.checks.memory = memoryCheck;
    if (memoryCheck.status !== 'healthy') {
      checks.status = 'degraded';
    }

    // Determinar status HTTP
    const statusCode = checks.status === 'healthy' ? 200 : 
                       checks.status === 'degraded' ? 200 : 503;

    return res.status(statusCode).json(checks);
  }

  /**
   * Verifica conexão com banco de dados
   */
  async checkDatabase() {
    const startTime = Date.now();
    const isPostgres = Boolean(
      process.env.DATABASE_URL ||
      process.env.DATABASE_TYPE === 'postgres' ||
      process.env.DATABASE_TYPE === 'postgresql'
    );
    const dbType = isPostgres ? 'postgresql' : 'sqlite';
    
    try {
      await db.query('SELECT 1 as healthy');

      return {
        status: 'healthy',
        type: dbType,
        responseTime: Date.now() - startTime,
        message: 'Conectado'
      };
    } catch (error) {
      console.error('❌ [HealthCheck] Falha na conexão com banco de dados');
      return {
        status: 'unhealthy',
        type: dbType,
        responseTime: Date.now() - startTime,
        message: 'Falha na conexão com o banco de dados'
      };
    }
  }

  /**
   * Verifica sistema de arquivos
   */
  checkFileSystem() {
    const uploadsDir = process.env.CHAT_UPLOADS_DIR || 
                       path.join(__dirname, '..', 'uploads', 'chat-documents');
    
    try {
      // Verificar se pasta existe
      if (!fs.existsSync(uploadsDir)) {
        return {
          status: 'degraded',
          path: uploadsDir,
          message: 'Pasta de uploads não existe (será criada automaticamente)'
        };
      }

      // Verificar permissões de escrita
      const testFile = path.join(uploadsDir, '.healthcheck');
      fs.writeFileSync(testFile, '');
      fs.unlinkSync(testFile);

      // Contar arquivos
      const files = fs.readdirSync(uploadsDir);
      const totalSize = files.reduce((acc, file) => {
        try {
          const stats = fs.statSync(path.join(uploadsDir, file));
          return acc + stats.size;
        } catch {
          return acc;
        }
      }, 0);

      return {
        status: 'healthy',
        path: uploadsDir,
        fileCount: files.length,
        totalSize: this.formatBytes(totalSize),
        message: 'Sistema de arquivos operacional'
      };
    } catch (error) {
      console.error('❌ [HealthCheck] Falha no sistema de arquivos:', error.message);
      return {
        status: 'unhealthy',
        message: 'Falha no acesso ao sistema de arquivos'
      };
    }
  }

  /**
   * Verifica uso de memória
   */
  checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const percentUsed = (heapUsedMB / heapTotalMB) * 100;

    let status = 'healthy';
    let message = 'Memória em níveis normais';

    if (percentUsed > 90) {
      status = 'unhealthy';
      message = 'Uso crítico de memória';
    } else if (percentUsed > 75) {
      status = 'degraded';
      message = 'Uso elevado de memória';
    }

    return {
      status,
      heapUsed: `${heapUsedMB.toFixed(2)} MB`,
      heapTotal: `${heapTotalMB.toFixed(2)} MB`,
      percentUsed: `${percentUsed.toFixed(1)}%`,
      message
    };
  }

  /**
   * GET /health/simple
   * Verificação simples para load balancers
   */
  async simpleCheck(req, res) {
    return res.status(200).send('OK');
  }

  /**
   * Formata bytes para leitura humana
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

module.exports = new HealthController();
