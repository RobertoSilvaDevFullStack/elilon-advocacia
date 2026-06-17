/**
 * Sprint 3.5 - Hermes Analysis Engine
 * Serviço para análise automática de pré-atendimentos jurídicos
 * 
 * Responsabilidades:
 * - Montar payload para Hermes
 * - Enviar para análise
 * - Validar e persistir resposta
 * - Tratar falhas com fallback
 */

const axios = require('axios');
const { Pool } = require('pg');
const { logger, preAtendimentoLogger } = require('../config/logger');
const ProviderFactory = require('./providers/ProviderFactory');
const hermesWebhookService = require('./HermesWebhookService');
const PreAtendimentoRepository = require('../repositories/PreAtendimentoRepository');

class HermesAnalysisService {
  constructor() {
    // Sprint 3.5.2: Integração com Provider Factory
    this.providerSetup = ProviderFactory.createConfigured();
    this.provider = this.providerSetup.provider;
    
    // Fallback para configuração legacy (Hermes API)
    this.hermesApiUrl = process.env.HERMES_API_URL || 'https://hermes.ai/api/v1';
    this.hermesApiKey = process.env.HERMES_API_KEY;
    this.model = process.env.HERMES_MODEL || 'claude-sonnet-4';
    
    this.maxRetries = 3;
    this.timeout = 30000; // 30 segundos
    
    // Configuração do banco
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
   * Inicia análise de um pré-atendimento
   * @param {number} preAtendimentoId - ID do pré-atendimento
   * @param {object} data - Dados do pré-atendimento
   * @returns {Promise<object>} - Resultado da análise
   */
  async analyzePreAtendimento(preAtendimentoId, data) {
    const startTime = Date.now();
    
    logger.info('[Hermes] Iniciando análise', {
      preAtendimentoId,
      area: data.area,
      subarea: data.subarea,
      provider: this.provider?.getName?.() || 'legacy/mock'
    });

    try {
      // 1. Criar registro inicial na tabela
      await this.createAnalysisRecord(preAtendimentoId);

      // 2. Sprint 3.5.2: Usar Provider se configurado, senão fallback
      let analysisResult;
      
      if (this.provider && this.provider.isConfigured()) {
        // Usar provider moderno (OpenAI, etc)
        analysisResult = await this.analyzeWithProvider(data);
      } else if (this.hermesApiKey) {
        // Fallback: API Hermes legacy
        const payload = this.buildPayload(data);
        analysisResult = await this.callHermesWithRetry(payload);
      } else {
        // Mock mode (desenvolvimento/testes)
        throw new Error('Nenhum provider de IA configurado. Configure OPENAI_API_KEY ou HERMES_API_KEY');
      }

      // 4. Validar resposta
      this.validateAnalysisResult(analysisResult);

      // 5. Persistir resultado
      await this.saveAnalysisResult(preAtendimentoId, analysisResult, startTime);

      // Sprint 3.10: Disparar evento hermes_analise_concluida (async, não bloqueia)
      PreAtendimentoRepository.findById(preAtendimentoId)
        .then((atendimento) => {
          if (atendimento) {
            hermesWebhookService.dispatch(preAtendimentoId, {
              atendimento,
              analysis: {
                ...analysisResult,
                resumo_executivo: analysisResult.resumo_executivo,
                entidades_detectadas: analysisResult.entidades_detectadas,
                observacoes: analysisResult.observacoes,
                modelo_ia: this.model,
                tempo_processamento_ms: Date.now() - startTime,
                status_analise: 'concluida',
              },
            });
          }
        })
        .catch((err) =>
          logger.error('[HermesWebhook] Falha ao buscar atendimento para webhook', { error: err.message })
        );

      const processingTime = Date.now() - startTime;
      
      logger.info('[Hermes] Análise concluída', {
        preAtendimentoId,
        tempoProcessamento: processingTime,
        urgencia: analysisResult.urgencia,
        complexidade: analysisResult.complexidade
      });

      return {
        success: true,
        data: analysisResult,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('[Hermes] Falha na análise', {
        preAtendimentoId,
        tempoProcessamento: processingTime,
        erro: error.message,
        stack: error.stack
      });

      // 6. Registrar falha (fallback)
      await this.handleFailure(preAtendimentoId, error, processingTime);

      return {
        success: false,
        error: error.message,
        processingTime
      };
    }
  }

  /**
   * Cria registro inicial na tabela de análises
   */
  async createAnalysisRecord(preAtendimentoId) {
    const query = `
      INSERT INTO chat_ai_analysis (
        pre_atendimento_id, 
        status_analise, 
        resumo_executivo
      ) VALUES ($1, 'processando', 'Análise em andamento...')
      ON CONFLICT (pre_atendimento_id) DO UPDATE SET
        status_analise = 'processando',
        updated_at = CURRENT_TIMESTAMP,
        resumo_executivo = 'Análise em andamento...'
      RETURNING id
    `;

    if (this.dbType === 'postgres') {
      await this.pool.query(query, [preAtendimentoId]);
    } else {
      // SQLite - usar require do sqlite3
      const sqlite3 = require('sqlite3').verbose();
      const path = require('path');
      const dbPath = path.join(__dirname, '..', 'database.sqlite');
      const db = new sqlite3.Database(dbPath);
      
      const sqliteQuery = query.replace(/\$1/g, '?');
      db.run(sqliteQuery, [preAtendimentoId], function(err) {
        if (err) console.error('[Hermes] Erro ao criar registro:', err);
        db.close();
      });
    }
  }

  /**
   * Monta o payload para envio ao Hermes
   */
  buildPayload(data) {
    return {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: this.formatUserContent(data)
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    };
  }

  /**
   * Prompt do sistema para Hermes
   */
  getSystemPrompt() {
    return `Você é Hermes, um analista jurídico especialista em triagem de casos para o escritório Elilon Lopes Advogados.

SUA MISSÃO:
Analisar pré-atendimentos jurídicos e gerar uma avaliação executiva para a equipe jurídica.

IMPORTANTE:
- Você NÃO conversa com o cliente
- Sua análise é APENAS para uso interno da equipe jurídica
- Seja objetivo, profissional e técnico
- Classifique com base em critérios jurídicos objetivos

FORMATO DE RESPOSTA (JSON obrigatório):
{
  "urgencia": "baixa|media|alta",
  "complexidade": "baixa|media|alta", 
  "area_confirmada": "string",
  "subarea_confirmada": "string",
  "resumo_executivo": "string (máx 500 chars)",
  "entidades_detectadas": {
    "partes": ["string"],
    "documentos_relevantes": ["string"],
    "prazos_potenciais": ["string"],
    "valores_mencionados": ["string"]
  },
  "observacoes": "string"
}

CRITÉRIOS DE URGÊNCIA:
- alta: Prazo prescricional próximo, risco de inscrição em cadastro de inadimplentes, necessidade de tutela de urgência
- media: Prazo razoável, mas demanda atenção priorizada
- baixa: Sem urgência imediata, pode seguir fluxo normal

CRITÉRIOS DE COMPLEXIDADE:
- alta: Múltiplas partes, matéria controvertida, necessidade de perícia, processo judicial complexo
- media: Questões jurídicas padrão mas com particularidades
- baixa: Questões simples, procedimentos rotineiros, documentação completa`;
  }

  /**
   * Formata os dados do usuário para o conteúdo do prompt
   */
  formatUserContent(data) {
    return `DADOS DO PRÉ-ATENDIMENTO:

Área Selecionada: ${data.area}
Subárea Selecionada: ${data.subarea || 'Não especificada'}

DESCRIÇÃO DO CASO:
${data.descricao || data.descricaoCaso || 'Sem descrição detalhada'}

${data.documentosAnexados ? `Documentos Anexados: ${data.documentosAnexados}` : ''}

Realize a análise e retorne APENAS o JSON no formato especificado.`;
  }

  /**
   * Chama API do Hermes com retry
   */
  async callHermesWithRetry(payload, attempt = 1) {
    try {
      const response = await axios.post(
        `${this.hermesApiUrl}/chat/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.hermesApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);

    } catch (error) {
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`[Hermes] Retry ${attempt}/${this.maxRetries} em ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        return this.callHermesWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Sprint 3.5.2: Analisa usando provider moderno (OpenAI, etc)
   * @param {object} data - Dados do caso
   * @returns {Promise<object>} - Resultado estruturado
   */
  async analyzeWithProvider(data) {
    if (!this.provider) {
      throw new Error('Provider não inicializado');
    }

    console.log(`[Hermes] Usando provider: ${this.provider.getName()}`);
    
    const result = await this.provider.analyzeCase({
      area: data.area,
      subarea: data.subarea,
      nome: data.nome,
      descricao: data.descricao || data.descricaoCaso
    });

    // Extrair metadados se existirem
    if (result._metadata) {
      console.log(`[Hermes] Tokens usados: ${result._metadata.tokens_total}`);
      delete result._metadata; // Remover antes de salvar
    }

    return result;
  }

  /**
   * Valida a estrutura do resultado da análise
   */
  validateAnalysisResult(result) {
    const requiredFields = [
      'urgencia', 'complexidade', 'area_confirmada', 
      'subarea_confirmada', 'resumo_executivo', 'observacoes'
    ];

    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    }

    // Validar valores de urgência e complexidade
    const validValues = ['baixa', 'media', 'alta'];
    
    if (!validValues.includes(result.urgencia)) {
      throw new Error(`Valor inválido para urgencia: ${result.urgencia}`);
    }
    
    if (!validValues.includes(result.complexidade)) {
      throw new Error(`Valor inválido para complexidade: ${result.complexidade}`);
    }
  }

  /**
   * Salva resultado da análise no banco
   */
  async saveAnalysisResult(preAtendimentoId, result, startTime) {
    const processingTime = Date.now() - startTime;
    
    const query = `
      UPDATE chat_ai_analysis SET
        status_analise = 'concluida',
        urgencia = $1,
        complexidade = $2,
        area_confirmada = $3,
        subarea_confirmada = $4,
        resumo_executivo = $5,
        entidades_detectadas = $6,
        observacoes = $7,
        tempo_processamento_ms = $8,
        modelo_ia = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE pre_atendimento_id = $10
    `;

    const params = [
      result.urgencia,
      result.complexidade,
      result.area_confirmada,
      result.subarea_confirmada,
      result.resumo_executivo,
      JSON.stringify(result.entidades_detectadas || {}),
      result.observacoes,
      processingTime,
      this.model,
      preAtendimentoId
    ];

    if (this.dbType === 'postgres') {
      await this.pool.query(query, params);
    } else {
      // SQLite
      const sqlite3 = require('sqlite3').verbose();
      const path = require('path');
      const dbPath = path.join(__dirname, '..', 'database.sqlite');
      const db = new sqlite3.Database(dbPath);
      
      const sqliteQuery = query.replace(/\$\d+/g, '?');
      db.run(sqliteQuery, params, function(err) {
        if (err) console.error('[Hermes] Erro ao salvar resultado:', err);
        db.close();
      });
    }
  }

  /**
   * Trata falhas na análise
   */
  async handleFailure(preAtendimentoId, error, processingTime) {
    const query = `
      UPDATE chat_ai_analysis SET
        status_analise = 'falha',
        resumo_executivo = $1,
        tempo_processamento_ms = $2,
        observacoes = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE pre_atendimento_id = $4
    `;

    const mensagemErro = `Análise não processada: ${error.message}`;
    const params = [mensagemErro, processingTime, error.message, preAtendimentoId];

    if (this.dbType === 'postgres') {
      await this.pool.query(query, params);
    } else {
      const sqlite3 = require('sqlite3').verbose();
      const path = require('path');
      const dbPath = path.join(__dirname, '..', 'database.sqlite');
      const db = new sqlite3.Database(dbPath);
      
      const sqliteQuery = query.replace(/\$\d+/g, '?');
      db.run(sqliteQuery, params, function(err) {
        if (err) console.error('[Hermes] Erro ao registrar falha:', err);
        db.close();
      });
    }
  }

  /**
   * Busca análise existente por pré-atendimento
   */
  async getAnalysisByPreAtendimentoId(preAtendimentoId) {
    const query = `
      SELECT * FROM chat_ai_analysis 
      WHERE pre_atendimento_id = $1
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (this.dbType === 'postgres') {
      const result = await this.pool.query(query, [preAtendimentoId]);
      return result.rows[0];
    } else {
      const sqlite3 = require('sqlite3').verbose();
      const path = require('path');
      const dbPath = path.join(__dirname, '..', 'database.sqlite');
      const db = new sqlite3.Database(dbPath);
      
      return new Promise((resolve, reject) => {
        db.get(query.replace('$1', '?'), [preAtendimentoId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
          db.close();
        });
      });
    }
  }

  /**
   * Reprocessa análise pendente ou com falha
   */
  async reprocessAnalysis(preAtendimentoId, data) {
    logger.info('[Hermes] Reprocessando análise', { preAtendimentoId });
    return this.analyzePreAtendimento(preAtendimentoId, data);
  }
}

module.exports = new HermesAnalysisService();
