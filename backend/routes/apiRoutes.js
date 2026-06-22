const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mainController = require("../controllers/mainController");
const contentController = require("../controllers/contentController");
const chatLeadController = require("../controllers/ChatLeadController");
const preAtendimentoAdminController = require("../controllers/PreAtendimentoAdminController");
const chatDocumentController = require("../controllers/ChatDocumentController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const diagnosticoLeadController = require("../controllers/DiagnosticoLeadController");
const diagnosticoPedidoController = require("../controllers/DiagnosticoPedidoController");
const asaasWebhookController = require("../controllers/AsaasWebhookController");

// Sprint 3.5: Hermes Analysis Engine
const aiAnalysisController = require("../controllers/AIAnalysisController");

// Sprint 3.4.3: Rate Limiting e File Validation
const {
  preAtendimentoLimiter,
  uploadLimiter,
  diagnosticoPedidoLimiter,
  diagnosticoLeadLimiter,
  asaasWebhookLimiter,
  leadsLimiter,
} = require("../middleware/rateLimiter");
const { createFileValidationMiddleware } = require("../utils/fileValidator");

// Sprint 3.4: Configuração do Multer para upload de documentos
const UPLOADS_DIR = process.env.CHAT_UPLOADS_DIR || path.join(__dirname, "..", "uploads", "chat-documents");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Nome temporário - será renomeado no controller
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "temp-" + uniqueSuffix + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10 // Máximo 10 arquivos
  }
});

const adminOnly = [
  authMiddleware.verifyToken,
  requireRole(["admin", "superadmin"]),
];

// Public Routes (Tracking & Lead Capture)
router.post("/track", mainController.trackVisit);
router.post("/leads", leadsLimiter, mainController.createLead); // Form submission from public site

// Sprint 3.6: Diagnóstico Tributário — Public (no auth required)
router.post("/diagnostico", diagnosticoLeadLimiter, diagnosticoLeadController.create);

// Sprint 3.11: Diagnóstico Tributário Premium — Pedidos e Pagamento
router.post("/diagnostico/pedido", diagnosticoPedidoLimiter, diagnosticoPedidoController.createPedido);
router.get("/diagnostico/pedido/:id", diagnosticoPedidoController.getPedido);

// Sprint 3.11: Webhook ASAAS
router.post("/asaas/webhook", asaasWebhookLimiter, asaasWebhookController.handleWebhook);

// Sprint 3.2: Chat Pré-Atendimento (Public - NO AUTH REQUIRED)
// Sprint 3.4.3: Rate limiting
router.post("/chat/pre-atendimento", preAtendimentoLimiter, chatLeadController.create);
router.get("/chat/pre-atendimento/:protocolo", chatLeadController.findByProtocolo);

// Sprint 3.4: Upload de Documentos do Chat (Public - NO AUTH REQUIRED)
// Sprint 3.4.3: Rate limiting + validação real de arquivos
router.post("/chat/upload-documents", 
  uploadLimiter, // Rate limit: 10 uploads/minuto
  upload.array("documents", 10),
  createFileValidationMiddleware(), // Validação por magic numbers
  chatDocumentController.upload
);
router.get("/chat/documents/:preAtendimentoId", chatDocumentController.listByPreAtendimento);

// Sprint 3.3: Painel Administrativo de Pré-Atendimentos (Protected - Admin Only)
router.get("/admin/chat/pre-atendimentos", ...adminOnly, preAtendimentoAdminController.list);
router.get("/admin/chat/pre-atendimentos/stats", ...adminOnly, preAtendimentoAdminController.getStats);
router.get("/admin/chat/pre-atendimentos/areas", ...adminOnly, preAtendimentoAdminController.getAreas);
router.get("/admin/chat/pre-atendimentos/subareas", ...adminOnly, preAtendimentoAdminController.getSubareas);
router.get("/admin/chat/pre-atendimentos/:id", ...adminOnly, preAtendimentoAdminController.getById);
router.put("/admin/chat/pre-atendimentos/:id/status", ...adminOnly, preAtendimentoAdminController.updateStatus);

// Sprint 3.4: Admin - Gerenciamento de Documentos
router.get("/admin/chat/documents", ...adminOnly, chatDocumentController.getStats);
router.get("/admin/chat/documents/download/:id", ...adminOnly, chatDocumentController.download);
router.get("/admin/chat/documents/:id", ...adminOnly, chatDocumentController.getById);
router.delete("/admin/chat/documents/:id", ...adminOnly, chatDocumentController.delete);

// Sprint 3.6: Diagnóstico Tributário — Admin Routes (protected)
router.get("/admin/diagnostico", ...adminOnly, diagnosticoLeadController.list);
router.get("/admin/diagnostico/stats", ...adminOnly, diagnosticoLeadController.getStats);

// Sprint 3.11: Diagnóstico Tributário Premium — Admin (rotas específicas ANTES de /:id)
router.get("/admin/diagnostico/pedidos", ...adminOnly, diagnosticoPedidoController.listPedidos);
router.get("/admin/diagnostico/pedidos/stats", ...adminOnly, diagnosticoPedidoController.getPedidosStats);
router.get("/admin/diagnostico/pedidos/export", ...adminOnly, diagnosticoPedidoController.exportPedidos);

router.get("/admin/diagnostico/:id", ...adminOnly, diagnosticoLeadController.getById);
router.put("/admin/diagnostico/:id/status", ...adminOnly, diagnosticoLeadController.updateStatus);

// Sprint 3.5: Hermes Analysis Engine - Admin Routes
router.get("/admin/chat/analysis/:preAtendimentoId", ...adminOnly, aiAnalysisController.getByPreAtendimento);
router.post("/admin/chat/analysis/:preAtendimentoId/reprocess", ...adminOnly, aiAnalysisController.reprocess);
router.get("/admin/chat/analysis/stats", ...adminOnly, aiAnalysisController.getStats);

// Sprint 3.9: Webhook Logs — Admin Routes
const chatWebhookLogController = require("../controllers/ChatWebhookLogController");
router.get("/admin/chat/webhook-logs/:preAtendimentoId", ...adminOnly, chatWebhookLogController.getByPreAtendimento);

// Sprint 3.10: Hermes Webhook Logs — Admin Routes
const hermesWebhookLogController = require("../controllers/HermesWebhookLogController");
router.get("/admin/chat/hermes-webhook-logs/:preAtendimentoId", ...adminOnly, hermesWebhookLogController.getByPreAtendimento);
router.post("/admin/chat/hermes-webhook-logs/:preAtendimentoId/reenviar", ...adminOnly, hermesWebhookLogController.reenviar);

// Public Content Routes (Read-only)
router.get("/posts", contentController.getPosts);
router.get("/professionals", contentController.getProfessionals);

// Password Reset (Public - NO AUTH REQUIRED)
router.post("/forgot-password", contentController.forgotPassword);
router.post("/reset-password", contentController.resetPassword);

// Auth: login/register em /api/auth (authRoutes.js)

// Protected Routes (Admin)
router.use(authMiddleware);
router.use(requireRole(["admin", "superadmin"]));

// Analytics & Dashboard
router.get("/dashboard", mainController.getDashboardStats);

// Leads Management
router.get("/leads", mainController.getLeads);
router.put("/leads/:id/status", mainController.updateLeadStatus);

// Settings
router.post("/settings", mainController.saveSettings);
router.get("/settings", mainController.getSettings);

// Content: Posts (Admin)
router.post("/posts", contentController.createPost);
router.put("/posts/:id", contentController.updatePost);
router.delete("/posts/:id", contentController.deletePost);

// Content: Professionals (Admin)
router.post("/professionals", contentController.createProfessional);
router.put("/professionals/:id", contentController.updateProfessional);
router.delete("/professionals/:id", contentController.deleteProfessional);

// Users
router.post("/users", contentController.createUser);
router.get("/users", contentController.getUsers);
router.put("/users/:id", contentController.updateUser);
router.put("/users/:id/approve", contentController.approveUser);
router.delete("/users/:id/reject", contentController.rejectUser);
router.delete("/users/:id", contentController.deleteUser);

module.exports = router;
