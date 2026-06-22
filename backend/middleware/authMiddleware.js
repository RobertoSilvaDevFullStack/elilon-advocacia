const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/jwtSecret");

const JWT_SECRET = getJwtSecret();

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "No token provided." });
  }

  // Remove "Bearer " prefix if present
  const bearerToken = token.startsWith("Bearer ") ? token.slice(7) : token;

  jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Failed to authenticate token." });
    }

    // Save decoded id to request for use in other routes
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Suporta ambos: authMiddleware (função direta) e authMiddleware.verifyToken (propriedade)
verifyToken.verifyToken = verifyToken;
module.exports = verifyToken;
