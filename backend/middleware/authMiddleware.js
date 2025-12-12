const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_prod";

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

module.exports = verifyToken;
