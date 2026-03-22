import { Router } from "express";
import { pool } from "../db/pool.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/health", async (_req, res) => {
  const mem = process.memoryUsage();
  try {
    await pool.query("SELECT 1");
    res.json({
      ok: true,
      db: "connected",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "1.0.0",
      node: process.version,
      memory: {
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
        rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(503).json({
      ok: false,
      db: "disconnected",
      message: "MySQL inaccessible",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/destinations", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT slug, name, country, rating, price_label AS price, tag
       FROM destinations
       ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors du chargement des destinations" });
  }
});

router.get("/map-markers", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT name, lat, lng, info
       FROM map_markers
       ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors du chargement des marqueurs" });
  }
});

router.get("/suggestions", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  try {
    const [all] = await pool.query(
      `SELECT type, title, description, duration, keywords
       FROM ai_suggestions
       ORDER BY id ASC`
    );

    if (!q) {
      return res.json({
        suggestions: all.map(({ type, title, description, duration }) => ({
          type,
          title,
          description,
          duration,
        })),
      });
    }

    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = all.map((s) => {
      const hay = `${s.title} ${s.description} ${s.keywords ?? ""}`.toLowerCase();
      const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
      return { ...s, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const picked = scored.filter((s) => s.score > 0);
    const list = picked.length ? picked : all;

    res.json({
      suggestions: list.slice(0, 8).map(({ type, title, description, duration }) => ({
        type,
        title,
        description,
        duration,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors du chargement des suggestions" });
  }
});

router.post("/search", optionalAuth, async (req, res) => {
  const raw = req.body?.query;
  if (typeof raw !== "string" || !raw.trim()) {
    return res.status(400).json({ error: "Champ query requis" });
  }
  const text = raw.trim().slice(0, 500);
  const userId = req.user?.id ?? null;
  try {
    await pool.query(`INSERT INTO hero_searches (query_text, user_id) VALUES (?, ?)`, [text, userId]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Impossible d'enregistrer la recherche" });
  }
});

export default router;
