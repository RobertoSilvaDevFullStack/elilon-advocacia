const db = require("../database");
const axios = require("axios");

// ANALYTICS
exports.getDashboardStats = (req, res) => {
  // Basic stats: total leads, total posts, total professionals
  const stats = {};

  db.serialize(() => {
    db.get(
      "SELECT COUNT(*) as count FROM leads",
      (err, row) => (stats.leads = row.count)
    );
    db.get(
      "SELECT COUNT(*) as count FROM posts",
      (err, row) => (stats.posts = row.count)
    );
    db.get(
      "SELECT COUNT(*) as count FROM professionals",
      (err, row) => (stats.professionals = row.count)
    );
    db.all(
      "SELECT * FROM daily_stats ORDER BY date DESC LIMIT 7",
      (err, rows) => {
        stats.chartData = rows;
        res.json({ success: true, stats });
      }
    );
  });
};

exports.trackVisit = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  db.run(
    `INSERT INTO daily_stats (date, visits) VALUES (?, 1) 
            ON CONFLICT(date) DO UPDATE SET visits = visits + 1`,
    [today],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
};

// LEADS & INTEGRATION
exports.createLead = (req, res) => {
  const { name, email, phone, city, interest, message } = req.body;

  // 1. Save to Local DB
  db.run(
    `INSERT INTO leads (name, email, phone, city, interest, message) VALUES (?,?,?,?,?,?)`,
    [name, email, phone, city, interest, message],
    function (err) {
      if (err)
        return res.status(500).json({ success: false, message: "DB Error" });

      // 2. Update Daily Stats
      const today = new Date().toISOString().split("T")[0];
      db.run(
        `INSERT INTO daily_stats (date, leads_count) VALUES (?, 1) 
                    ON CONFLICT(date) DO UPDATE SET leads_count = leads_count + 1`,
        [today]
      );

      // 3. Trigger Webhook (Integration)
      db.get(
        "SELECT value FROM settings WHERE key = 'webhook_url'",
        (err, row) => {
          if (row && row.value) {
            axios
              .post(row.value, req.body)
              .then(() => console.log("Webhook triggered successfully"))
              .catch((err) => console.error("Webhook failed", err.message));
          }
        }
      );

      res.json({ success: true, message: "Lead saved" });
    }
  );
};

exports.getLeads = (req, res) => {
  db.all("SELECT * FROM leads ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.updateLeadStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run(
    "UPDATE leads SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
};

// SETTINGS
exports.saveSettings = (req, res) => {
  const { webhook_url } = req.body;
  db.run(
    `INSERT INTO settings (key, value) VALUES ('webhook_url', ?) 
            ON CONFLICT(key) DO UPDATE SET value = ?`,
    [webhook_url, webhook_url],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
};

exports.getSettings = (req, res) => {
  db.get("SELECT value FROM settings WHERE key = 'webhook_url'", (err, row) => {
    res.json({ webhook_url: row ? row.value : "" });
  });
};
