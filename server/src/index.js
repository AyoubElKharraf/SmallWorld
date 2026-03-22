import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import morgan from "morgan";
import apiRouter from "./routes/api.js";
import { apiLimiter } from "./middleware/security.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = Number(process.env.PORT || 3001);
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

if (isProd) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
}

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin && corsOrigin.length > 0 ? corsOrigin : true,
    credentials: true,
  })
);

app.use(morgan(isProd ? "combined" : "dev"));
app.use(express.json({ limit: "512kb" }));

app.use("/api", apiLimiter);
app.use("/api", apiRouter);

const staticDir = process.env.SERVE_STATIC_DIR;
const hasStatic = Boolean(staticDir && fs.existsSync(staticDir));

if (hasStatic) {
  app.use(express.static(staticDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(staticDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Route introuvable" });
  }
  if (hasStatic) {
    return res.status(404).send("Not found");
  }
  return res.status(404).json({ error: "Route introuvable" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`[${new Date().toISOString()}] Serveur → http://0.0.0.0:${port} (${isProd ? "production" : "development"})`);
  if (hasStatic) {
    console.log(`SPA + statiques : ${staticDir}`);
  }
  console.log(`Santé : GET http://localhost:${port}/api/health`);
});
