const db = require("../database/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_prod";

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    const user = result.rows[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res
        .status(401)
        .json({ success: false, token: null, message: "Senha inválida" });
    }

    // Check if user is approved
    if (user.approved === false || user.approved === 0 || user.approved === 'false') {
      return res.status(403).json({
        success: false,
        code: "PENDING_APPROVAL",
        message: "Sua conta está pendente de aprovação. Aguarde contato do administrador."
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).json({
      success: true,
      token: token,
      user: { username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Preencha todos os campos obrigatórios"
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "A senha deve ter no mínimo 6 caracteres"
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email inválido"
    });
  }

  try {
    // Check if username or email already exists
    const existingUser = await db.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.username === username) {
        return res.status(400).json({
          success: false,
          message: "Nome de usuário já cadastrado"
        });
      }
      if (existing.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email já cadastrado"
        });
      }
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insert new user with approved = false and role = 'editor'
    const result = await db.query(
      "INSERT INTO users (username, email, password, role, approved) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, approved",
      [username, email, hashedPassword, 'editor', false]
    );

    res.status(201).json({
      success: true,
      message: "Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao cadastrar usuário. Tente novamente."
    });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId; // From middleware

  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];
    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);

    if (!passwordIsValid) {
      return res
        .status(401)
        .json({ success: false, message: "Current password incorrect" });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedNewPassword,
      userId,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating password" });
  }
};
