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

// Sprint 3.4.3: Rate Limiting e File Validation
const { preAtendimentoLimiter, uploadLimiter } = require("../middleware/rateLimiter");
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

// Public Routes (Tracking & Lead Capture)
router.post("/track", mainController.trackVisit);
router.post("/leads", mainController.createLead); // Form submission from public site

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
router.get("/chat/documents/download/:id", chatDocumentController.download);

// Sprint 3.3: Painel Administrativo de Pré-Atendimentos (Protected - Admin Only)
router.get("/admin/chat/pre-atendimentos", authMiddleware.verifyToken, preAtendimentoAdminController.list);
router.get("/admin/chat/pre-atendimentos/stats", authMiddleware.verifyToken, preAtendimentoAdminController.getStats);
router.get("/admin/chat/pre-atendimentos/areas", authMiddleware.verifyToken, preAtendimentoAdminController.getAreas);
router.get("/admin/chat/pre-atendimentos/subareas", authMiddleware.verifyToken, preAtendimentoAdminController.getSubareas);
router.get("/admin/chat/pre-atendimentos/:id", authMiddleware.verifyToken, preAtendimentoAdminController.getById);
router.put("/admin/chat/pre-atendimentos/:id/status", authMiddleware.verifyToken, preAtendimentoAdminController.updateStatus);

// Sprint 3.4: Admin - Gerenciamento de Documentos
router.get("/admin/chat/documents", authMiddleware.verifyToken, chatDocumentController.getStats);
router.get("/admin/chat/documents/:id", authMiddleware.verifyToken, chatDocumentController.getById);
router.delete("/admin/chat/documents/:id", authMiddleware.verifyToken, chatDocumentController.delete);

// Public Content Routes (Read-only)
router.get("/posts", contentController.getPosts);
router.get("/professionals", contentController.getProfessionals);

// Password Reset (Public - NO AUTH REQUIRED)
router.post("/forgot-password", contentController.forgotPassword);
router.post("/reset-password", contentController.resetPassword);

// Auth Routes (Public)
const authController = require("../controllers/authController");
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// Protected Routes (Admin)
router.use(authMiddleware);

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
