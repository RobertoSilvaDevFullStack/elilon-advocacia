const db = require("../database-postgres");
const axios = require("axios");

// ANALYTICS
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {};

    const leadsResult = await db.query("SELECT COUNT(*) as count FROM leads");
    stats.leads = parseInt(leadsResult.rows[0].count);

    const postsResult = await db.query("SELECT COUNT(*) as count FROM posts");
    stats.posts = parseInt(postsResult.rows[0].count);

    const profResult = await db.query(
      "SELECT COUNT(*) as count FROM professionals"
    );
    stats.professionals = parseInt(profResult.rows[0].count);

    const chartResult = await db.query(
      "SELECT * FROM daily_stats ORDER BY date DESC LIMIT 7"
    );
    stats.chartData = chartResult.rows;

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.trackVisit = async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  try {
    await db.query(
      `INSERT INTO daily_stats (date, visits) VALUES ($1, 1) 
       ON CONFLICT(date) DO UPDATE SET visits = daily_stats.visits + 1`,
      [today]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Track visit error:", err);
    res.status(500).json({ error: err.message });
  }
};

// LEADS & INTEGRATION
exports.createLead = async (req, res) => {
  const { name, email, phone, city, interest, message } = req.body;

  try {
    // 1. Save to Local DB
    await db.query(
      `INSERT INTO leads (name, email, phone, city, interest, message) VALUES ($1,$2,$3,$4,$5,$6)`,
      [name, email, phone, city, interest, message]
    );

    // 2. Update Daily Stats
    const today = new Date().toISOString().split("T")[0];
    await db.query(
      `INSERT INTO daily_stats (date, leads_count) VALUES ($1, 1) 
       ON CONFLICT(date) DO UPDATE SET leads_count = daily_stats.leads_count + 1`,
      [today]
    );

    // 3. Trigger Webhook (Integration)
    const settingsResult = await db.query(
      "SELECT value FROM settings WHERE key = 'webhook_url'"
    );

    if (settingsResult.rows.length > 0 && settingsResult.rows[0].value) {
      axios
        .post(settingsResult.rows[0].value, req.body)
        .then(() => console.log("Webhook triggered successfully"))
        .catch((err) => console.error("Webhook failed", err.message));
    }

    res.json({ success: true, message: "Lead saved" });
  } catch (err) {
    console.error("Create lead error:", err);
    res.status(500).json({ success: false, message: "DB Error" });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM leads ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get leads error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query("UPDATE leads SET status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Update lead status error:", err);
    res.status(500).json({ error: err.message });
  }
};

// SETTINGS
exports.saveSettings = async (req, res) => {
  const { webhook_url } = req.body;
  try {
    await db.query(
      `INSERT INTO settings (key, value) VALUES ('webhook_url', $1) 
       ON CONFLICT(key) DO UPDATE SET value = $1`,
      [webhook_url]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Save settings error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT value FROM settings WHERE key = 'webhook_url'"
    );
    res.json({
      webhook_url: result.rows.length > 0 ? result.rows[0].value : "",
    });
  } catch (err) {
    console.error("Get settings error:", err);
    res.json({ webhook_url: "" });
  }
};
