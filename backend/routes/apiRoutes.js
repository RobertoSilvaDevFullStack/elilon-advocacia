const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const contentController = require("../controllers/contentController");
const authMiddleware = require("../middleware/authMiddleware");

// Public Routes (Tracking & Lead Capture)
router.post("/track", mainController.trackVisit);
router.post("/leads", mainController.createLead); // Form submission from public site

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

// Content: Posts
router.get("/posts", contentController.getPosts);
router.post("/posts", contentController.createPost);
router.delete("/posts/:id", contentController.deletePost);

// Content: Professionals
router.get("/professionals", contentController.getProfessionals);
router.post("/professionals", contentController.createProfessional);
router.delete("/professionals/:id", contentController.deleteProfessional);

// Users
router.get("/users", contentController.getUsers);

module.exports = router;
