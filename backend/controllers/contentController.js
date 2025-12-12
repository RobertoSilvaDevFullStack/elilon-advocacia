const db = require("../database");

// POSTS
exports.getPosts = (req, res) => {
  db.all("SELECT * FROM posts ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createPost = (req, res) => {
  const { title, category, content, image } = req.body;
  const slug = title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  db.run(
    `INSERT INTO posts (title, slug, category, content, image) VALUES (?,?,?,?,?)`,
    [title, slug, category, content, image],
    function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
};

exports.deletePost = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM posts WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
};

// PROFESSIONALS
exports.getProfessionals = (req, res) => {
  db.all("SELECT * FROM professionals", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createProfessional = (req, res) => {
  const { name, role, oab, area, bio, image } = req.body;
  db.run(
    `INSERT INTO professionals (name, role, oab, area, bio, image) VALUES (?,?,?,?,?,?)`,
    [name, role, oab, area, bio, image],
    function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
};

exports.deleteProfessional = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM professionals WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
};

// USERS
exports.getUsers = (req, res) => {
  db.all("SELECT id, username, role, created_at FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
