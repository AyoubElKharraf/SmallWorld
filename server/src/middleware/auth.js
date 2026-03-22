import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function optionalAuth(req, _res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return next();
  try {
    const p = jwt.verify(h.slice(7), JWT_SECRET);
    req.user = { id: p.id, email: p.email, role: p.role, name: p.name };
  } catch {
    /* token invalide : traiter comme invité */
  }
  next();
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise" });
  }
  try {
    const p = jwt.verify(h.slice(7), JWT_SECRET);
    req.user = { id: p.id, email: p.email, role: p.role, name: p.name };
    next();
  } catch {
    return res.status(401).json({ error: "Session invalide ou expirée" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès administrateur requis" });
  }
  next();
}
