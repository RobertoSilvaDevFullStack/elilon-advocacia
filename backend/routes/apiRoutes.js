const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const contentController = require("../controllers/contentController");
const chatLeadController = require("../controllers/ChatLeadController");
const preAtendimentoAdminController = require("../controllers/PreAtendimentoAdminController");
const authMiddleware = require("../middleware/authMiddleware");

// Public Routes (Tracking & Lead Capture)
router.post("/track", mainController.trackVisit);
router.post("/leads", mainController.createLead); // Form submission from public site

// Sprint 3.2: Chat Pré-Atendimento (Public - NO AUTH REQUIRED)
router.post("/chat/pre-atendimento", chatLeadController.create);
router.get("/chat/pre-atendimento/:protocolo", chatLeadController.findByProtocolo);

// Sprint 3.3: Painel Administrativo de Pré-Atendimentos (Protected - Admin Only)
router.get("/admin/chat/pre-atendimentos", authMiddleware.verifyToken, preAtendimentoAdminController.list);
router.get("/admin/chat/pre-atendimentos/stats", authMiddleware.verifyToken, preAtendimentoAdminController.getStats);
router.get("/admin/chat/pre-atendimentos/areas", authMiddleware.verifyToken, preAtendimentoAdminController.getAreas);
router.get("/admin/chat/pre-atendimentos/subareas", authMiddleware.verifyToken, preAtendimentoAdminController.getSubareas);
router.get("/admin/chat/pre-atendimentos/:id", authMiddleware.verifyToken, preAtendimentoAdminController.getById);
router.put("/admin/chat/pre-atendimentos/:id/status", authMiddleware.verifyToken, preAtendimentoAdminController.updateStatus);

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
