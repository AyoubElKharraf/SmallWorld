import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, body, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY is_read ASC, created_at DESC
       LIMIT 80`,
      [req.user.id]
    );
    const unread = rows.filter((r) => !r.is_read).length;
    res.json({ notifications: rows, unreadCount: unread });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Impossible de charger les notifications" });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "id invalide" });
  try {
    const [r] = await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: "Notification introuvable" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Mise à jour impossible" });
  }
});

router.post("/read-all", requireAuth, async (req, res) => {
  try {
    await pool.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`, [
      req.user.id,
    ]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Mise à jour impossible" });
  }
});

export default router;
