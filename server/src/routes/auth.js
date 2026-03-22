import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db/pool.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { devSqlHint, mysqlUserMessage } from "../db/mysqlErrors.js";

const router = Router();
const SALT = 10;

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
    return res.status(400).json({ error: "email, password et name requis" });
  }
  const em = email.trim().toLowerCase();
  const nm = name.trim();
  if (!em || !nm || password.length < 8) {
    return res.status(400).json({ error: "Mot de passe (8 caractères min.) et champs valides requis" });
  }
  try {
    const hash = await bcrypt.hash(password, SALT);
    const [r] = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'client')`,
      [em, hash, nm]
    );
    const id = Number(r.insertId);
    const token = signToken({ id, email: em, role: "client", name: nm });
    res.status(201).json({
      token,
      user: { id, email: em, name: nm, role: "client" },
    });
  } catch (e) {
    const code = e?.code;
    if (code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Cet e-mail est déjà utilisé" });
    }
    console.error(e);
    const friendly = mysqlUserMessage(e);
    if (friendly) {
      return res.status(500).json({ error: friendly + devSqlHint(e) });
    }
    res.status(500).json({
      error:
        "Erreur serveur lors de l'inscription. Réessayez plus tard." + devSqlHint(e),
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email et password requis" });
  }
  const em = email.trim().toLowerCase();
  try {
    const [rows] = await pool.query(
      `SELECT id, email, password_hash, name, role FROM users WHERE email = ? LIMIT 1`,
      [em]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "E-mail ou mot de passe incorrect" });
    }
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    const friendly = mysqlUserMessage(e);
    if (friendly) {
      return res.status(500).json({ error: friendly + devSqlHint(e) });
    }
    res.status(500).json({
      error: "Connexion impossible pour le moment." + devSqlHint(e),
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, name, role, created_at FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    const u = rows[0];
    if (!u) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(u);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  const { name, email } = req.body ?? {};
  const hasName = name !== undefined;
  const hasEmail = email !== undefined;
  if (!hasName && !hasEmail) {
    return res.status(400).json({ error: "Indiquez au moins un champ : name ou email" });
  }
  if (hasName && (typeof name !== "string" || !name.trim())) {
    return res.status(400).json({ error: "Le nom ne peut pas être vide" });
  }
  if (hasEmail && (typeof email !== "string" || !email.trim())) {
    return res.status(400).json({ error: "E-mail invalide" });
  }
  const nm = hasName ? name.trim() : null;
  const em = hasEmail ? email.trim().toLowerCase() : null;
  if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    return res.status(400).json({ error: "Format d’e-mail invalide" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, email, name, role FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    const current = rows[0];
    if (!current) return res.status(404).json({ error: "Utilisateur introuvable" });

    const nextName = nm ?? current.name;
    const nextEmail = em ?? current.email;

    if (em && em !== current.email) {
      const [dup] = await pool.query(`SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1`, [
        em,
        req.user.id,
      ]);
      if (dup[0]) {
        return res.status(409).json({ error: "Cet e-mail est déjà utilisé" });
      }
    }

    await pool.query(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [
      nextName,
      nextEmail,
      req.user.id,
    ]);

    const token = signToken({
      id: req.user.id,
      email: nextEmail,
      role: current.role,
      name: nextName,
    });

    const [updated] = await pool.query(
      `SELECT id, email, name, role, created_at FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    const u = updated[0];
    res.json({ token, user: u });
  } catch (e) {
    const code = e?.code;
    if (code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Cet e-mail est déjà utilisé" });
    }
    console.error(e);
    const friendly = mysqlUserMessage(e);
    if (friendly) {
      return res.status(500).json({ error: friendly + devSqlHint(e) });
    }
    res.status(500).json({ error: "Impossible de mettre à jour le profil." + devSqlHint(e) });
  }
});

router.patch("/me/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return res.status(400).json({ error: "currentPassword et newPassword requis" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit faire au moins 8 caractères" });
  }
  try {
    const [rows] = await pool.query(
      `SELECT password_hash FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Utilisateur introuvable" });
    if (!(await bcrypt.compare(currentPassword, row.password_hash))) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" });
    }
    const hash = await bcrypt.hash(newPassword, SALT);
    await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    const friendly = mysqlUserMessage(e);
    if (friendly) {
      return res.status(500).json({ error: friendly + devSqlHint(e) });
    }
    res.status(500).json({ error: "Impossible de changer le mot de passe." + devSqlHint(e) });
  }
});

export default router;
