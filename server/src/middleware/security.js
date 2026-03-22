import rateLimit from "express-rate-limit";

/** Limite globale sur les routes /api (sauf surcharge sur /auth). */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_API_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessayez plus tard." },
});

/** Connexion / inscription : plus strict. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de connexion. Réessayez dans quelques minutes." },
});
