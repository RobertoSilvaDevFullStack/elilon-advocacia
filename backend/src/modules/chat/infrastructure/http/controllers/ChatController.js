/**
 * ChatController - Camada de apresentação HTTP
 * Sprint 1: Endpoints básicos do módulo Chat
 */

const chatService = require("../../../application/ChatService");

class ChatController {
  /**
   * POST /api/chat/session
   * Criar nova sessão de chat
   */
  async createSession(req, res) {
    try {
      const clientInfo = {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await chatService.startSession(req.body, clientInfo);

      res.status(201).json({
        success: true,
        data: {
          sessionId: result.session.id,
          state: result.session.current_state,
          expiresAt: result.session.expires_at,
          welcomeMessage: {
            id: result.welcomeMessage.id,
            content: result.welcomeMessage.content,
            senderType: result.welcomeMessage.sender_type,
            metadata: result.welcomeMessage.metadata,
            createdAt: result.welcomeMessage.created_at,
          },
        },
      });
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao iniciar atendimento. Tente novamente.",
      });
    }
  }

  /**
   * GET /api/chat/session/:id
   * Recuperar sessão existente
   */
  async getSession(req, res) {
    try {
      const { id } = req.params;
      const { session, messages } = await chatService.getSession(id);

      res.status(200).json({
        success: true,
        data: {
          session: {
            id: session.id,
            state: session.current_state,
            source: session.source,
            clientName: session.client_name,
            clientEmail: session.client_email,
            clientPhone: session.client_phone,
            createdAt: session.created_at,
            expiresAt: session.expires_at,
            closedAt: session.closed_at,
            protocolNumber: session.protocol_number,
          },
          messages: messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            contentHtml: msg.content_html,
            senderType: msg.sender_type,
            metadata: msg.metadata,
            createdAt: msg.created_at,
          })),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar sessão:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Sessão não encontrada ou expirada.",
      });
    }
  }

  /**
   * POST /api/chat/session/:id/message
   * Enviar mensagem
   */
  async sendMessage(req, res) {
    try {
      const { id: sessionId } = req.params;
      const { content } = req.body;

      if (!content || content.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Mensagem não pode estar vazia.",
        });
      }

      const result = await chatService.sendMessage(
        sessionId,
        content.trim(),
        "USER"
      );

      res.status(200).json({
        success: true,
        data: {
          userMessage: {
            id: result.userMessage.id,
            content: result.userMessage.content,
            senderType: result.userMessage.sender_type,
            createdAt: result.userMessage.created_at,
          },
          botResponse: {
            id: result.botResponse.id,
            content: result.botResponse.content,
            contentHtml: result.botResponse.content_html,
            senderType: result.botResponse.sender_type,
            metadata: result.botResponse.metadata,
            createdAt: result.botResponse.created_at,
          },
          currentState: result.session.current_state,
        },
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao enviar mensagem.",
      });
    }
  }

  /**
   * GET /api/chat/session/:id/messages
   * Listar mensagens da sessão
   */
  async getMessages(req, res) {
    try {
      const { id: sessionId } = req.params;
      const limit = parseInt(req.query.limit) || 100;

      // Reutilizar getSession para validar
      const { messages } = await chatService.getSession(sessionId);

      // Aplicar limit
      const limitedMessages = messages.slice(0, limit);

      res.status(200).json({
        success: true,
        data: {
          messages: limitedMessages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            contentHtml: msg.content_html,
            senderType: msg.sender_type,
            metadata: msg.metadata,
            createdAt: msg.created_at,
          })),
          count: limitedMessages.length,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao buscar mensagens.",
      });
    }
  }

  /**
   * POST /api/chat/session/:id/close
   * Fechar sessão
   */
  async closeSession(req, res) {
    try {
      const { id: sessionId } = req.params;

      const result = await chatService.closeSession(sessionId);

      res.status(200).json({
        success: true,
        data: {
          sessionId: result.session.id,
          protocolNumber: result.protocolNumber,
          closedAt: result.session.closed_at,
        },
      });
    } catch (error) {
      console.error("Erro ao fechar sessão:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao encerrar atendimento.",
      });
    }
  }
}

module.exports = new ChatController();
