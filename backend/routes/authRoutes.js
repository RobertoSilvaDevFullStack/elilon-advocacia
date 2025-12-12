const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/register", verifyToken, authController.register); // Protected: Only admins can create admins
router.post("/change-password", verifyToken, authController.changePassword);

module.exports = router;
