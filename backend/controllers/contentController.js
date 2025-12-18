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
  const { title, category, content, image, excerpt } = req.body;
  const slug = title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  // Set author_id to admin user (ID 1) - only one user exists
  const author_id = 1;

  try {
    const result = await db.query(
      `INSERT INTO posts (title, slug, category, content, image, excerpt, author_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [title, slug, category, content, image, excerpt, author_id]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, category, content, image, excerpt } = req.body;

  // Generate slug from title if provided
  const slug = title
    ? title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "")
    : undefined;

  try {
    await db.query(
      `UPDATE posts 
       SET title = $1, slug = $2, category = $3, content = $4, image = $5, excerpt = $6
       WHERE id = $7`,
      [title, slug, category, content, image, excerpt, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Update post error:", err);
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
  const {
    name,
    role,
    oab,
    area,
    bio,
    image,
    email,
    phone,
    linkedin,
    location,
    education,
    specializations,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO professionals (name, role, oab, area, bio, image, email, phone, linkedin, location, education, specializations) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
        name,
        role,
        oab,
        area,
        bio,
        image,
        email,
        phone,
        linkedin,
        location,
        JSON.stringify(education || []),
        JSON.stringify(specializations || []),
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Create professional error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfessional = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    role,
    oab,
    area,
    bio,
    image,
    email,
    phone,
    linkedin,
    location,
    education,
    specializations,
  } = req.body;

  try {
    await db.query(
      `UPDATE professionals 
       SET name=$1, role=$2, oab=$3, area=$4, bio=$5, image=$6, email=$7, phone=$8, linkedin=$9, location=$10, education=$11, specializations=$12
       WHERE id=$13`,
      [
        name,
        role,
        oab,
        area,
        bio,
        image,
        email,
        phone,
        linkedin,
        location,
        JSON.stringify(education || []),
        JSON.stringify(specializations || []),
        id,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Update professional error:", err);
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
    res.status(500).json({ success: false, message: err.message });
  }
};

// USERS
exports.createUser = async (req, res) => {
  const { username, email, password, role, approved } = req.body;

  try {
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, email, password, role, approved) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [username, email, hashedPassword, role, approved || false]
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, role, approved, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, approved, password } = req.body;

  try {
    // If password provided, hash it
    if (password) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users SET username = $1, email = $2, role = $3, approved = $4, password = $5 WHERE id = $6`,
        [username, email, role, approved, hashedPassword, id]
      );
    } else {
      // Update without password
      await db.query(
        `UPDATE users SET username = $1, email = $2, role = $3, approved = $4 WHERE id = $5`,
        [username, email, role, approved, id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserApproval = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`UPDATE users SET approved = NOT approved WHERE id = $1`, [
      id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Toggle approval error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
