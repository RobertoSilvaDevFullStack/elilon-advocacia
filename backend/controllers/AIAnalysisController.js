/**
 * Sprint 3.5 - Hermes Analysis Engine
 * Controller para gerenciamento de análises de IA
 */

const hermesService = require('../services/HermesAnalysisService');
const { logger } = require('../config/logger');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class AIAnalysisController {
  constructor() {
    this.dbType = process.env.DATABASE_TYPE || 'sqlite';
    if (this.dbType === 'postgres' || process.env.DATABASE_URL) {
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'elilon_advocacia_db',
        user: process.env.DB_USER || 'elilon_db_user',
        password: process.env.DB_PASSWORD || ''
      });
    }
  }

  /**
   * GET /api/admin/chat/analysis/:preAtendimentoId
   * Busca análise de IA por pré-atendimento (Admin)
   */
  async getByPreAtendimento(req, res) {
    try {
      const { preAtendimentoId } = req.params;
      
      logger.info('[AIAnalysis] Buscando análise', { preAtendimentoId });

      const analysis = await hermesService.getAnalysisByPreAtendimentoId(preAtendimentoId);

      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: 'Análise não encontrada'
        });
      }

      return res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      logger.error('[AIAnalysis] Erro ao buscar análise', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/admin/chat/analysis/:preAtendimentoId/reprocess
   * Reprocessa análise (Admin)
   */
  async reprocess(req, res) {
    try {
      const { preAtendimentoId } = req.params;
      
      logger.info('[AIAnalysis] Solicitação de reprocessamento', { preAtendimentoId });

      // Buscar dados do pré-atendimento
      const preAtendimento = await this.getPreAtendimentoData(preAtendimentoId);
      
      if (!preAtendimento) {
        return res.status(404).json({
          success: false,
          error: 'Pré-atendimento não encontrado'
        });
      }

      // Disparar análise
      const result = await hermesService.reprocessAnalysis(preAtendimentoId, preAtendimento);

      if (result.success) {
        return res.json({
          success: true,
          message: 'Análise reprocessada com sucesso',
          processingTime: result.processingTime
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('[AIAnalysis] Erro no reprocessamento', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/chat/analysis/stats
   * Estatísticas de análises (Admin)
   */
  async getStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status_analise = 'concluida' THEN 1 END) as concluidas,
          COUNT(CASE WHEN status_analise = 'falha' THEN 1 END) as falhas,
          COUNT(CASE WHEN status_analise = 'pendente' THEN 1 END) as pendentes,
          COUNT(CASE WHEN urgencia = 'alta' THEN 1 END) as urgencia_alta,
          COUNT(CASE WHEN urgencia = 'media' THEN 1 END) as urgencia_media,
          COUNT(CASE WHEN urgencia = 'baixa' THEN 1 END) as urgencia_baixa,
          COUNT(CASE WHEN complexidade = 'alta' THEN 1 END) as complexidade_alta,
          COUNT(CASE WHEN complexidade = 'media' THEN 1 END) as complexidade_media,
          COUNT(CASE WHEN complexidade = 'baixa' THEN 1 END) as complexidade_baixa,
          AVG(tempo_processamento_ms) as tempo_medio_ms
        FROM chat_ai_analysis
      `;

      let stats;
      if (this.dbType === 'postgres') {
        const result = await this.pool.query(query);
        stats = result.rows[0];
      } else {
        const dbPath = path.join(__dirname, '..', 'database.sqlite');
        const db = new sqlite3.Database(dbPath);
        
        stats = await new Promise((resolve, reject) => {
          db.get(query, (err, row) => {
            if (err) reject(err);
            else resolve(row);
            db.close();
          });
        });
      }

      return res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('[AIAnalysis] Erro nas estatísticas', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Busca dados completos do pré-atendimento
   */
  async getPreAtendimentoData(id) {
    const query = `
      SELECT 
        cpa.*,
        json_agg(
          json_build_object(
            'id', cd.id,
            'filename', cd.filename,
            'originalname', cd.originalname,
            'mimetype', cd.mimetype
          )
        ) FILTER (WHERE cd.id IS NOT NULL) as documentos
      FROM chat_pre_atendimentos cpa
      LEFT JOIN chat_documents cd ON cd.pre_atendimento_id = cpa.id
      WHERE cpa.id = $1
      GROUP BY cpa.id
    `;

    if (this.dbType === 'postgres') {
      const result = await this.pool.query(query, [id]);
      return result.rows[0];
    } else {
      const dbPath = path.join(__dirname, '..', 'database.sqlite');
      const db = new sqlite3.Database(dbPath);
      
      const preAtendimento = await new Promise((resolve, reject) => {
        db.get(query.replace('$1', '?'), [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      // Buscar documentos separadamente para SQLite
      const docsQuery = `SELECT id, filename, originalname, mimetype FROM chat_documents WHERE pre_atendimento_id = ?`;
      const documentos = await new Promise((resolve, reject) => {
        db.all(docsQuery, [id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
          db.close();
        });
      });

      if (preAtendimento) {
        preAtendimento.documentos = documentos;
      }

      return preAtendimento;
    }
  }
}

module.exports = new AIAnalysisController();
