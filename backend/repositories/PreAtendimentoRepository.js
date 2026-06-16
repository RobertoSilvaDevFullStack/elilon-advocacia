/**
 * PreAtendimentoRepository
 * Sprint 3.2: Persistência e Protocolo
 * 
 * Responsabilidades:
 * - Persistir dados do pré-atendimento
 * - Consultar protocolo
 * - Buscar atendimentos
 */

const db = require("../database/index");

class PreAtendimentoRepository {
  /**
   * Cria um novo pré-atendimento
   * @param {Object} data - Dados do pré-atendimento
   * @returns {Promise<Object>} - Registro criado
   */
  async create(data) {
    const {
      protocolo,
      area,
      subarea,
      nome,
      telefone,
      email,
      cidade,
      estado,
      descricao_caso,
      status = "novo"
    } = data;

    const query = `
      INSERT INTO chat_pre_atendimentos (
        protocolo, area, subarea, nome, telefone, email, 
        cidade, estado, descricao_caso, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      protocolo,
      area,
      subarea,
      nome,
      telefone,
      email,
      cidade,
      estado,
      descricao_caso,
      status
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Busca um pré-atendimento por protocolo
   * @param {string} protocolo - Protocolo do atendimento
   * @returns {Promise<Object|null>} - Registro encontrado ou null
   */
  async findByProtocolo(protocolo) {
    const query = `
      SELECT * FROM chat_pre_atendimentos 
      WHERE protocolo = $1
    `;

    const result = await db.query(query, [protocolo]);
    return result.rows[0] || null;
  }

  /**
   * Busca um pré-atendimento por ID
   * @param {string} id - UUID do atendimento
   * @returns {Promise<Object|null>} - Registro encontrado ou null
   */
  async findById(id) {
    const query = `
      SELECT * FROM chat_pre_atendimentos 
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Lista todos os pré-atendimentos (com paginação opcional)
   * @param {Object} options - Opções de filtro e paginação
   * @returns {Promise<Array>} - Lista de registros
   */
  async findAll(options = {}) {
    const { limit = 50, offset = 0, status, area } = options;
    
    let query = `
      SELECT * FROM chat_pre_atendimentos 
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (area) {
      query += ` AND area = $${paramIndex}`;
      values.push(area);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Atualiza o status de um pré-atendimento
   * @param {string} id - UUID do atendimento
   * @param {string} status - Novo status
   * @returns {Promise<Object>} - Registro atualizado
   */
  async updateStatus(id, status) {
    const query = `
      UPDATE chat_pre_atendimentos 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  /**
   * Conta o número de atendimentos do dia para geração de protocolo
   * @param {string} date - Data no formato YYYYMMDD
   * @returns {Promise<number>} - Contagem
   */
  async countByDate(date) {
    const query = `
      SELECT COUNT(*) as count 
      FROM chat_pre_atendimentos 
      WHERE protocolo LIKE $1
    `;

    const result = await db.query(query, [`JUR-${date}-%`]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Busca pré-atendimentos por termo (nome, telefone, email ou protocolo)
   * Sprint 3.3: Painel Administrativo
   * @param {string} searchTerm - Termo de busca
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Array>} - Lista de registros encontrados
   */
  async search(searchTerm, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const query = `
      SELECT * FROM chat_pre_atendimentos 
      WHERE nome ILIKE $1 
         OR telefone ILIKE $1 
         OR email ILIKE $1 
         OR protocolo ILIKE $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const values = [`%${searchTerm}%`, limit, offset];
    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Busca com filtros avançados
   * Sprint 3.3: Filtros do Painel Administrativo
   * @param {Object} filters - Filtros de busca
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Array>} - Lista de registros
   */
  async findWithFilters(filters = {}, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      status, 
      area, 
      subarea,
      dataInicio,
      dataFim 
    } = { ...filters, ...options };
    
    let query = `
      SELECT * FROM chat_pre_atendimentos 
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (area) {
      query += ` AND area = $${paramIndex}`;
      values.push(area);
      paramIndex++;
    }

    if (subarea) {
      query += ` AND subarea = $${paramIndex}`;
      values.push(subarea);
      paramIndex++;
    }

    if (dataInicio) {
      query += ` AND created_at >= $${paramIndex}`;
      values.push(dataInicio);
      paramIndex++;
    }

    if (dataFim) {
      query += ` AND created_at <= $${paramIndex}`;
      values.push(dataFim);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Estatísticas para o dashboard
   * Sprint 3.3: Cards do Dashboard
   * @returns {Promise<Object>} - Estatísticas
   */
  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const monthStart = firstDayOfMonth.toISOString().split('T')[0];

    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(created_at) = $1 THEN 1 END) as hoje,
        COUNT(CASE WHEN DATE(created_at) >= $2 THEN 1 END) as mes,
        COUNT(CASE WHEN status = 'novo' THEN 1 END) as novos,
        COUNT(CASE WHEN status = 'em_analise' THEN 1 END) as em_analise,
        COUNT(CASE WHEN status = 'convertido' THEN 1 END) as convertidos
      FROM chat_pre_atendimentos
    `;

    const result = await db.query(statsQuery, [today, monthStart]);
    return result.rows[0];
  }
}

module.exports = new PreAtendimentoRepository();
