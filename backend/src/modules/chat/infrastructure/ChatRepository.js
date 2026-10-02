/**
 * ChatRepository - Camada de acesso a dados do módulo Chat
 * Sprint 1: Implementação básica com PostgreSQL
 */

const pool = require("../../../../database-postgres");

class ChatRepository {
  /**
   * Criar novo cliente
   */
  async createClient(clientData) {
    const query = `
      INSERT INTO chat_clients (name, email, phone, city, state)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.city,
      clientData.state,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Criar nova sessão de chat
   */
  async createSession(sessionData) {
    const query = `
      INSERT INTO chat_sessions (client_id, current_state, source, ip_address, user_agent, consent_lgpd)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      sessionData.clientId,
      sessionData.currentState || "START",
      sessionData.source || "widget",
      sessionData.ipAddress,
      sessionData.userAgent,
      sessionData.consentLgpd || false,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Buscar sessão por ID
   */
  async getSessionById(sessionId) {
    const query = `
      SELECT s.*, c.name as client_name, c.email as client_email, c.phone as client_phone
      FROM chat_sessions s
      LEFT JOIN chat_clients c ON s.client_id = c.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  }

  /**
   * Listar sessões ativas (não expiradas)
   */
  async getActiveSessions() {
    const query = `
      SELECT s.*, c.name as client_name
      FROM chat_sessions s
      LEFT JOIN chat_clients c ON s.client_id = c.id
      WHERE s.expires_at > CURRENT_TIMESTAMP
      AND s.closed_at IS NULL
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Atualizar estado da sessão
   */
  async updateSessionState(sessionId, newState, context = {}) {
    const query = `
      UPDATE chat_sessions
      SET current_state = $1,
          context = COALESCE(context, '{}') || $2::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const values = [newState, JSON.stringify(context), sessionId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Fechar sessão
   */
  async closeSession(sessionId, protocolNumber = null) {
    const query = `
      UPDATE chat_sessions
      SET closed_at = CURRENT_TIMESTAMP,
          protocol_number = COALESCE($1, protocol_number)
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [protocolNumber, sessionId]);
    return result.rows[0] || null;
  }

  /**
   * Criar mensagem
   */
  async createMessage(messageData) {
    const query = `
      INSERT INTO chat_messages (session_id, sender_type, content, content_html, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      messageData.sessionId,
      messageData.senderType,
      messageData.content,
      messageData.contentHtml,
      JSON.stringify(messageData.metadata || {}),
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Buscar mensagens de uma sessão
   */
  async getMessagesBySession(sessionId, limit = 100) {
    const query = `
      SELECT * FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `;
    const result = await pool.query(query, [sessionId, limit]);
    return result.rows;
  }

  /**
   * Atualizar cliente com dados da triagem
   */
  async updateClientTriage(clientId, triageData) {
    const query = `
      UPDATE chat_clients
      SET area_juridica = $1,
          subarea = $2,
          case_description = $3,
          has_existing_process = $4,
          process_number = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [
      triageData.areaJuridica,
      triageData.subarea,
      triageData.caseDescription,
      triageData.hasExistingProcess,
      triageData.processNumber,
      clientId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Registrar consentimento LGPD
   */
  async registerLGPDConsent(sessionId) {
    const query = `
      UPDATE chat_sessions
      SET consent_lgpd = true,
          consent_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  }
}

module.exports = new ChatRepository();
