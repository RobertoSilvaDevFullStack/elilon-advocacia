const db = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_prod";

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: "Server error" });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid)
      return res
        .status(401)
        .json({ success: false, token: null, message: "Invalid Password" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res
      .status(200)
      .json({
        success: true,
        token: token,
        user: { username: user.username, role: user.role },
      });
  });
};

exports.register = (req, res) => {
  const { username, password } = req.body;

  // Simple validation (can be improved)
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username and password required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err)
        return res
          .status(500)
          .json({
            success: false,
            message: "Error registering user (Username might be taken)",
          });
      res
        .status(200)
        .json({ success: true, message: "User registered successfully!" });
    }
  );
};

exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId; // From middleware

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user)
      return res
        .status(500)
        .json({ success: false, message: "User not found" });

    // Verify current password
    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordIsValid)
      return res
        .status(401)
        .json({ success: false, message: "Current password incorrect" });

    // Update
    const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, userId],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Error updating password" });
        res
          .status(200)
          .json({ success: true, message: "Password updated successfully" });
      }
    );
  });
};
