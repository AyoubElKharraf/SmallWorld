/**
 * Crée un compte administrateur si absent.
 * Usage : depuis server/ → npm run seed:admin
 * Prérequis : tables users existantes, variables DB dans .env
 */
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const email = "admin@voyageur.local";
const name = "Administrateur";
const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME || "smallworld",
  });

  const [[existing]] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
  if (existing) {
    console.log(`Compte admin déjà présent : ${email}`);
    await pool.end();
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')`,
    [email, hash, name]
  );
  console.log(`Compte admin créé : ${email}`);
  console.log(`Mot de passe (à changer) : ${password}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
