const db = require("../database-postgres");

// POSTS
exports.getPosts = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { title, category, content, image } = req.body;
  const slug = title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  try {
    const result = await db.query(
      `INSERT INTO posts (title, slug, category, content, image) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [title, slug, category, content, image]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ success: false });
  }
};

// PROFESSIONALS
exports.getProfessionals = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM professionals");
    res.json(result.rows);
  } catch (err) {
    console.error("Get professionals error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createProfessional = async (req, res) => {
  const { name, role, oab, area, bio, image } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO professionals (name, role, oab, area, bio, image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, role, oab, area, bio, image]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Create professional error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProfessional = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM professionals WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete professional error:", err);
    res.status(500).json({ success: false });
  }
};

// USERS
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, role, created_at FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: err.message });
  }
};
