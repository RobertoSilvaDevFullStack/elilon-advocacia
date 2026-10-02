/**
 * ChatDocumentRepository
 * Sprint 3.4: Upload de Documentos - Persistência Local
 * 
 * Responsabilidades:
 * - Persistir metadados dos documentos
 * - Relacionar documentos com pré-atendimentos
 * - Buscar e listar documentos
 * - Download de documentos
 */

const db = require("../database/index");
const path = require("path");
const fs = require("fs").promises;

class ChatDocumentRepository {
  /**
   * Cria um novo registro de documento
   * @param {Object} data - Dados do documento
   * @returns {Promise<Object>} - Registro criado
   */
  async create(data) {
    const {
      pre_atendimento_id,
      original_name,
      file_name,
      extension,
      size_bytes,
      mime_type,
      storage_path
    } = data;

    const query = `
      INSERT INTO chat_documents (
        pre_atendimento_id, original_name, file_name, extension,
        size_bytes, mime_type, storage_path, uploaded_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      pre_atendimento_id,
      original_name,
      file_name,
      extension,
      size_bytes,
      mime_type,
      storage_path
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Busca um documento por ID
   * @param {string} id - UUID do documento
   * @returns {Promise<Object|null>} - Registro encontrado ou null
   */
  async findById(id) {
    const query = `
      SELECT d.*, p.protocolo as pre_atendimento_protocolo
      FROM chat_documents d
      JOIN chat_pre_atendimentos p ON d.pre_atendimento_id = p.id
      WHERE d.id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca documentos por pré-atendimento
   * @param {string} preAtendimentoId - UUID do pré-atendimento
   * @returns {Promise<Array>} - Lista de documentos
   */
  async findByPreAtendimentoId(preAtendimentoId) {
    const query = `
      SELECT d.*, p.protocolo as pre_atendimento_protocolo
      FROM chat_documents d
      JOIN chat_pre_atendimentos p ON d.pre_atendimento_id = p.id
      WHERE d.pre_atendimento_id = $1
      ORDER BY d.uploaded_at DESC
    `;

    const result = await db.query(query, [preAtendimentoId]);
    return result.rows;
  }

  /**
   * Lista todos os documentos (com paginação opcional)
   * @param {Object} options - Opções de filtro e paginação
   * @returns {Promise<Array>} - Lista de registros
   */
  async findAll(options = {}) {
    const { limit = 50, offset = 0, pre_atendimento_id, extension } = options;
    
    let query = `
      SELECT d.*, p.protocolo as pre_atendimento_protocolo
      FROM chat_documents d
      JOIN chat_pre_atendimentos p ON d.pre_atendimento_id = p.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (pre_atendimento_id) {
      query += ` AND d.pre_atendimento_id = $${paramIndex}`;
      values.push(pre_atendimento_id);
      paramIndex++;
    }

    if (extension) {
      query += ` AND d.extension = $${paramIndex}`;
      values.push(extension.toUpperCase());
      paramIndex++;
    }

    query += ` ORDER BY d.uploaded_at DESC`;

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(limit);
      paramIndex++;
    }

    if (offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(offset);
      paramIndex++;
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Conta total de documentos (com filtros opcionais)
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<number>} - Total de registros
   */
  async count(filters = {}) {
    const { pre_atendimento_id, extension } = filters;
    
    let query = `
      SELECT COUNT(*) as total
      FROM chat_documents
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (pre_atendimento_id) {
      query += ` AND pre_atendimento_id = $${paramIndex}`;
      values.push(pre_atendimento_id);
      paramIndex++;
    }

    if (extension) {
      query += ` AND extension = $${paramIndex}`;
      values.push(extension.toUpperCase());
      paramIndex++;
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Deleta um documento (e remove o arquivo físico)
   * @param {string} id - UUID do documento
   * @param {string} uploadsDir - Diretório de uploads
   * @returns {Promise<boolean>} - true se deletado com sucesso
   */
  async delete(id, uploadsDir) {
    // Buscar documento primeiro
    const document = await this.findById(id);
    if (!document) {
      return false;
    }

    // Deletar do banco
    const query = `DELETE FROM chat_documents WHERE id = $1`;
    await db.query(query, [id]);

    // Tentar deletar arquivo físico (não falha se não existir)
    try {
      const filePath = path.join(uploadsDir, document.storage_path);
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(`⚠️ Arquivo físico não encontrado ou erro ao deletar: ${document.storage_path}`);
    }

    return true;
  }

  /**
   * Busca um documento por nome de arquivo (único)
   * @param {string} fileName - Nome do arquivo no servidor
   * @returns {Promise<Object|null>} - Registro encontrado ou null
   */
  async findByFileName(fileName) {
    const query = `
      SELECT d.*, p.protocolo as pre_atendimento_protocolo
      FROM chat_documents d
      JOIN chat_pre_atendimentos p ON d.pre_atendimento_id = p.id
      WHERE d.file_name = $1
    `;

    const result = await db.query(query, [fileName]);
    return result.rows[0] || null;
  }

  /**
   * Verifica se arquivo físico existe
   * @param {string} storagePath - Caminho relativo do arquivo
   * @param {string} uploadsDir - Diretório base de uploads
   * @returns {Promise<boolean>} - true se arquivo existe
   */
  async fileExists(storagePath, uploadsDir) {
    try {
      const filePath = path.join(uploadsDir, storagePath);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém estatísticas de documentos
   * @param {string} preAtendimentoId - UUID do pré-atendimento (opcional)
   * @returns {Promise<Object>} - Estatísticas
   */
  async getStats(preAtendimentoId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(size_bytes), 0) as total_size,
        COUNT(DISTINCT extension) as unique_extensions
      FROM chat_documents
    `;
    const values = [];

    if (preAtendimentoId) {
      query += ` WHERE pre_atendimento_id = $1`;
      values.push(preAtendimentoId);
    }

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = new ChatDocumentRepository();
