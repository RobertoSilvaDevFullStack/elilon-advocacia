/**
 * ChatDocumentController
 * Sprint 3.4: Upload de Documentos - Persistência Local
 * 
 * Responsabilidades:
 * - Receber upload de múltiplos arquivos (multer)
 * - Salvar arquivos no filesystem local
 * - Persistir metadados no PostgreSQL
 * - Listar documentos por pré-atendimento
 * - Download de documentos
 */

const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const ChatDocumentRepository = require("../repositories/ChatDocumentRepository");
const PreAtendimentoRepository = require("../repositories/PreAtendimentoRepository");
const chatWebhookService = require("../services/ChatWebhookService");

// Configurações de upload
const UPLOADS_DIR = process.env.CHAT_UPLOADS_DIR || path.join(__dirname, "..", "uploads", "chat-documents");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Garantir que o diretório de uploads existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`📁 Diretório de uploads criado: ${UPLOADS_DIR}`);
}

class ChatDocumentController {
  /**
   * POST /api/chat/upload-documents
   * Upload de múltiplos documentos para um pré-atendimento
   * Usa multer para processar multipart/form-data
   */
  async upload(req, res) {
    try {
      const { pre_atendimento_id, pre_atendimento_protocolo } = req.body;
      
      // Verificar se há pré-atendimento
      if (!pre_atendimento_id && !pre_atendimento_protocolo) {
        return res.status(400).json({
          success: false,
          error: "ID ou protocolo do pré-atendimento é obrigatório"
        });
      }

      // Buscar pré-atendimento
      let preAtendimento;
      if (pre_atendimento_id) {
        preAtendimento = await PreAtendimentoRepository.findById(pre_atendimento_id);
      } else {
        preAtendimento = await PreAtendimentoRepository.findByProtocolo(pre_atendimento_protocolo);
      }

      if (!preAtendimento) {
        return res.status(404).json({
          success: false,
          error: "Pré-atendimento não encontrado"
        });
      }

      // Verificar se há arquivos
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Nenhum arquivo enviado"
        });
      }

      // Validar quantidade máxima
      const maxFiles = 10;
      if (req.files.length > maxFiles) {
        // Remover arquivos já salvos
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.warn(`⚠️ Não foi possível remover arquivo temporário: ${file.path}`);
          }
        });
        
        return res.status(400).json({
          success: false,
          error: `Máximo de ${maxFiles} arquivos permitidos. Recebidos: ${req.files.length}`
        });
      }

      // Processar cada arquivo
      const uploadedDocuments = [];
      const errors = [];

      for (const file of req.files) {
        try {
          // Validar extensão
          const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
          if (!ALLOWED_EXTENSIONS.includes(ext)) {
            fs.unlinkSync(file.path);
            errors.push(`${file.originalname}: Extensão não permitida (${ext})`);
            continue;
          }

          // Validar MIME type
          if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            fs.unlinkSync(file.path);
            errors.push(`${file.originalname}: Tipo de arquivo não permitido`);
            continue;
          }

          // Gerar nome único
          const uniqueId = uuidv4();
          const fileName = `${uniqueId}_${file.originalname}`;
          const storagePath = path.join(UPLOADS_DIR, fileName);

          // Mover arquivo para destino final
          fs.renameSync(file.path, storagePath);

          // Criar registro no banco
          const document = await ChatDocumentRepository.create({
            pre_atendimento_id: preAtendimento.id,
            original_name: file.originalname,
            file_name: fileName,
            extension: ext.toUpperCase(),
            size_bytes: file.size,
            mime_type: file.mimetype,
            storage_path: fileName // Caminho relativo ao UPLOADS_DIR
          });

          uploadedDocuments.push({
            id: document.id,
            original_name: document.original_name,
            file_name: document.file_name,
            extension: document.extension,
            size_bytes: document.size_bytes,
            mime_type: document.mime_type,
            uploaded_at: document.uploaded_at
          });

        } catch (fileError) {
          console.error(`❌ Erro ao processar arquivo ${file.originalname}:`, fileError);
          errors.push(`${file.originalname}: ${fileError.message}`);
          
          // Tentar remover arquivo em caso de erro no banco
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (e) {
            // Ignora erro na limpeza
          }
        }
      }

      // Retornar resultado
      if (uploadedDocuments.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Nenhum arquivo foi processado com sucesso",
          details: errors
        });
      }

      // Sprint 3.9: Re-disparar webhook com documentos vinculados (async, não bloqueia)
      chatWebhookService.dispatch(preAtendimento.id, {
        atendimento: preAtendimento,
        documentos: uploadedDocuments,
        hermes: null,
      }).catch((err) =>
        console.error("[ChatWebhook] Falha no re-dispatch pós-upload:", err.message)
      );

      return res.status(201).json({
        success: true,
        message: `${uploadedDocuments.length} documento(s) enviado(s) com sucesso`,
        data: {
          pre_atendimento_id: preAtendimento.id,
          pre_atendimento_protocolo: preAtendimento.protocolo,
          documents: uploadedDocuments,
          total_uploaded: uploadedDocuments.length,
          errors: errors.length > 0 ? errors : undefined
        }
      });

    } catch (error) {
      console.error("❌ Erro no upload de documentos:", error);
      
      // Limpar arquivos em caso de erro geral
      if (req.files) {
        req.files.forEach(file => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (e) {
            // Ignora erro na limpeza
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível processar os documentos"
      });
    }
  }

  /**
   * GET /api/chat/documents/:preAtendimentoId
   * Lista todos os documentos de um pré-atendimento
   */
  async listByPreAtendimento(req, res) {
    try {
      const { preAtendimentoId } = req.params;

      if (!preAtendimentoId) {
        return res.status(400).json({
          success: false,
          error: "ID do pré-atendimento é obrigatório"
        });
      }

      // Verificar se pré-atendimento existe
      const preAtendimento = await PreAtendimentoRepository.findById(preAtendimentoId);
      if (!preAtendimento) {
        return res.status(404).json({
          success: false,
          error: "Pré-atendimento não encontrado"
        });
      }

      // Buscar documentos
      const documents = await ChatDocumentRepository.findByPreAtendimentoId(preAtendimentoId);

      // Adicionar informação de existência do arquivo
      const documentsWithStatus = documents.map(doc => ({
        ...doc,
        file_exists: fs.existsSync(path.join(UPLOADS_DIR, doc.storage_path))
      }));

      // Estatísticas
      const stats = await ChatDocumentRepository.getStats(preAtendimentoId);

      return res.status(200).json({
        success: true,
        data: {
          pre_atendimento_id: preAtendimentoId,
          pre_atendimento_protocolo: preAtendimento.protocolo,
          documents: documentsWithStatus,
          stats: {
            total_count: parseInt(stats.total_count, 10),
            total_size_bytes: parseInt(stats.total_size, 10),
            total_size_formatted: this.formatFileSize(parseInt(stats.total_size, 10))
          }
        }
      });

    } catch (error) {
      console.error("❌ Erro ao listar documentos:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível listar os documentos"
      });
    }
  }

  /**
   * GET /api/chat/documents/download/:id
   * Download de um documento específico
   */
  async download(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID do documento é obrigatório"
        });
      }

      // Buscar documento
      const document = await ChatDocumentRepository.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Documento não encontrado"
        });
      }

      // Construir caminho completo
      const filePath = path.join(UPLOADS_DIR, document.storage_path);

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: "Arquivo não encontrado no servidor"
        });
      }

      // Configurar headers para download
      res.setHeader("Content-Type", document.mime_type);
      res.setHeader("Content-Disposition", `attachment; filename="${document.original_name}"`);
      res.setHeader("Content-Length", document.size_bytes);

      // Stream do arquivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on("error", (error) => {
        console.error(`❌ Erro ao fazer stream do arquivo ${id}:`, error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: "Erro ao ler arquivo"
          });
        }
      });

    } catch (error) {
      console.error("❌ Erro no download:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível fazer o download"
      });
    }
  }

  /**
   * GET /api/admin/chat/documents/:id
   * Busca detalhes de um documento (Admin)
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID do documento é obrigatório"
        });
      }

      const document = await ChatDocumentRepository.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Documento não encontrado"
        });
      }

      // Verificar existência do arquivo
      const fileExists = fs.existsSync(path.join(UPLOADS_DIR, document.storage_path));

      return res.status(200).json({
        success: true,
        data: {
          ...document,
          file_exists: fileExists,
          download_url: `/api/chat/documents/download/${id}`
        }
      });

    } catch (error) {
      console.error("❌ Erro ao buscar documento:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno"
      });
    }
  }

  /**
   * DELETE /api/admin/chat/documents/:id
   * Remove um documento (Admin)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID do documento é obrigatório"
        });
      }

      const deleted = await ChatDocumentRepository.delete(id, UPLOADS_DIR);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Documento não encontrado"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Documento removido com sucesso"
      });

    } catch (error) {
      console.error("❌ Erro ao deletar documento:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno"
      });
    }
  }

  /**
   * GET /api/admin/chat/documents/stats
   * Estatísticas de documentos (Admin)
   */
  async getStats(req, res) {
    try {
      const stats = await ChatDocumentRepository.getStats();

      return res.status(200).json({
        success: true,
        data: {
          total_count: parseInt(stats.total_count, 10),
          total_size_bytes: parseInt(stats.total_size, 10),
          total_size_formatted: this.formatFileSize(parseInt(stats.total_size, 10)),
          unique_extensions: parseInt(stats.unique_extensions, 10)
        }
      });

    } catch (error) {
      console.error("❌ Erro ao buscar estatísticas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno"
      });
    }
  }

  /**
   * Formata tamanho de arquivo para exibição
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

module.exports = new ChatDocumentController();
