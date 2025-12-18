const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const contentController = require("../controllers/contentController");
const authMiddleware = require("../middleware/authMiddleware");

// Public Routes (Tracking & Lead Capture)
router.post("/track", mainController.trackVisit);
router.post("/leads", mainController.createLead); // Form submission from public site

// Public Content Routes (Read-only)
router.get("/posts", contentController.getPosts);
router.get("/professionals", contentController.getProfessionals);

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
router.patch("/users/:id/approve", contentController.toggleUserApproval);
router.delete("/users/:id", contentController.deleteUser);

module.exports = router;
