/**
 * Chat Routes - Rotas do módulo Chat Jurídico
 * Sprint 1: Endpoints básicos
 * Base: /api/chat
 */

const express = require("express");
const chatController = require("./infrastructure/http/controllers/ChatController");

const router = express.Router();

// POST /api/chat/session - Criar nova sessão
router.post("/session", chatController.createSession);

// GET /api/chat/session/:id - Buscar sessão
router.get("/session/:id", chatController.getSession);

// POST /api/chat/session/:id/message - Enviar mensagem
router.post("/session/:id/message", chatController.sendMessage);

// GET /api/chat/session/:id/messages - Listar mensagens
router.get("/session/:id/messages", chatController.getMessages);

// POST /api/chat/session/:id/close - Fechar sessão
router.post("/session/:id/close", chatController.closeSession);

module.exports = router;
