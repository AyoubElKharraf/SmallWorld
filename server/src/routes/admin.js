import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

function parsePageLimit(q) {
  const page = Math.max(1, parseInt(String(q.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(q.limit ?? "25"), 10) || 25));
  return { page, limit, offset: (page - 1) * limit };
}

router.get("/stats", async (_req, res) => {
  try {
    const [[clients]] = await pool.query(
      `SELECT COUNT(*) AS n FROM users WHERE role = 'client'`
    );
    const [[admins]] = await pool.query(`SELECT COUNT(*) AS n FROM users WHERE role = 'admin'`);
    const [[searches]] = await pool.query(`SELECT COUNT(*) AS n FROM hero_searches`);
    const [[notifs]] = await pool.query(`SELECT COUNT(*) AS n FROM notifications`);
    res.json({
      clients: clients.n,
      admins: admins.n,
      searches: searches.n,
      notifications: notifs.n,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Statistiques indisponibles" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { page, limit, offset } = parsePageLimit(req.query);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users`);
    const [rows] = await pool.query(
      `SELECT id, email, name, role, created_at FROM users ORDER BY id ASC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({
      data: rows,
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit) || 1,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Liste utilisateurs indisponible" });
  }
});

router.get("/searches", async (req, res) => {
  try {
    const { page, limit, offset } = parsePageLimit(req.query);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM hero_searches`);
    const [rows] = await pool.query(
      `SELECT h.id, h.query_text, h.created_at, h.user_id, u.email AS user_email, u.name AS user_name
       FROM hero_searches h
       LEFT JOIN users u ON u.id = h.user_id
       ORDER BY h.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({
      data: rows,
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit) || 1,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Historique indisponible" });
  }
});

/** Export CSV (UTF-8 avec BOM pour Excel). */
router.get("/searches/export", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.id, h.query_text, h.created_at, h.user_id, u.email AS user_email, u.name AS user_name
       FROM hero_searches h
       LEFT JOIN users u ON u.id = h.user_id
       ORDER BY h.created_at DESC`
    );
    const cell = (v) => {
      const s = v == null ? "" : String(v);
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = "id,query_text,created_at,user_id,user_email,user_name";
    const body = rows
      .map(
        (r) =>
          [r.id, r.query_text, r.created_at, r.user_id ?? "", r.user_email ?? "", r.user_name ?? ""]
            .map(cell)
            .join(",")
      )
      .join("\r\n");
    const csv = `\uFEFF${header}\r\n${body}`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="voyageur-recherches.csv"');
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Export impossible" });
  }
});

router.post("/notifications", async (req, res) => {
  const { title, body, type = "info", broadcastToAll, userId } = req.body ?? {};
  if (typeof title !== "string" || typeof body !== "string" || !title.trim() || !body.trim()) {
    return res.status(400).json({ error: "title et body requis" });
  }
  const allowed = ["info", "success", "warning", "error"];
  const t = allowed.includes(type) ? type : "info";

  try {
    if (broadcastToAll === true) {
      const [clients] = await pool.query(`SELECT id FROM users WHERE role = 'client'`);
      if (!clients.length) {
        return res.json({ ok: true, sent: 0, message: "Aucun client inscrit" });
      }
      for (const c of clients) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)`,
          [c.id, title.trim(), body.trim(), t]
        );
      }
      return res.json({ ok: true, sent: clients.length });
    }

    const uid = Number(userId);
    if (!Number.isFinite(uid)) {
      return res.status(400).json({ error: "userId requis si broadcastToAll est faux" });
    }
    await pool.query(
      `INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)`,
      [uid, title.trim(), body.trim(), t]
    );
    res.json({ ok: true, sent: 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Envoi impossible" });
  }
});

export default router;
