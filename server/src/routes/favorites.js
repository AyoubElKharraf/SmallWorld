import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { devSqlHint, mysqlUserMessage } from "../db/mysqlErrors.js";

const router = Router();

router.get("/keys", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT target_key FROM user_favorites WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ targets: rows.map((r) => r.target_key) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Impossible de charger les favoris" });
  }
});

async function validateTargetKey(targetKey) {
  if (typeof targetKey !== "string" || targetKey.length < 6) return false;
  if (targetKey.startsWith("dest:")) {
    const slug = targetKey.slice(5);
    if (!slug) return false;
    const [d] = await pool.query(`SELECT 1 FROM destinations WHERE slug = ? LIMIT 1`, [slug]);
    return d.length > 0;
  }
  if (targetKey.startsWith("sugg:")) {
    const id = Number(targetKey.slice(5));
    if (!Number.isFinite(id)) return false;
    const [s] = await pool.query(`SELECT 1 FROM ai_suggestions WHERE id = ? LIMIT 1`, [id]);
    return s.length > 0;
  }
  return false;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT target_key, created_at FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    const destinations = [];
    const suggestions = [];
    for (const row of rows) {
      const tk = row.target_key;
      if (tk.startsWith("dest:")) {
        const slug = tk.slice(5);
        const [d] = await pool.query(
          `SELECT slug, name, country, rating, review_count, price_label, price_from_eur, price_was_label,
                  tag, availability, deal_badge, viewers_recent
           FROM destinations WHERE slug = ? LIMIT 1`,
          [slug]
        );
        if (d[0]) {
          destinations.push({
            ...d[0],
            targetKey: tk,
            favoritedAt: row.created_at,
          });
        }
      } else if (tk.startsWith("sugg:")) {
        const id = Number(tk.slice(5));
        const [s] = await pool.query(
          `SELECT id, type, title, description, duration FROM ai_suggestions WHERE id = ? LIMIT 1`,
          [id]
        );
        if (s[0]) {
          suggestions.push({
            ...s[0],
            targetKey: tk,
            favoritedAt: row.created_at,
          });
        }
      }
    }
    res.json({
      targets: rows.map((r) => r.target_key),
      destinations,
      suggestions,
    });
  } catch (e) {
    console.error(e);
    const friendly = mysqlUserMessage(e);
    if (friendly) return res.status(500).json({ error: friendly + devSqlHint(e) });
    res.status(500).json({ error: "Impossible de charger les favoris" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { targetKey } = req.body ?? {};
  try {
    if (!(await validateTargetKey(targetKey))) {
      return res.status(400).json({ error: "targetKey invalide ou référence inconnue (ex. dest:santorini, sugg:1)" });
    }
    await pool.query(`INSERT INTO user_favorites (user_id, target_key) VALUES (?, ?)`, [
      req.user.id,
      targetKey,
    ]);
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Déjà en favoris" });
    }
    console.error(e);
    const friendly = mysqlUserMessage(e);
    if (friendly) return res.status(500).json({ error: friendly + devSqlHint(e) });
    res.status(500).json({ error: "Impossible d’ajouter le favori" });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  const { targetKey } = req.body ?? {};
  if (typeof targetKey !== "string" || !targetKey) {
    return res.status(400).json({ error: "targetKey requis dans le corps JSON" });
  }
  try {
    const [r] = await pool.query(`DELETE FROM user_favorites WHERE user_id = ? AND target_key = ?`, [
      req.user.id,
      targetKey,
    ]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Favori introuvable" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Suppression impossible" });
  }
});

export default router;
