const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/login", authLimiter, authController.login);
router.post("/register", verifyToken, authController.register); // Protected: Only admins can create admins
router.post("/change-password", verifyToken, authController.changePassword);

module.exports = router;
