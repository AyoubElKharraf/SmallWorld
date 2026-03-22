/**
 * Messages exploitables pour l’utilisateur (pas de fuite de chemins serveur).
 * mysql2 : err.code (ex. ER_NO_SUCH_TABLE), err.sqlMessage (détail technique).
 */
export function mysqlUserMessage(err) {
  const code = err?.code;
  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "PROTOCOL_CONNECTION_LOST"
  ) {
    return "La base de données est injoignable. Vérifiez que MySQL tourne et les variables DB_* dans server/.env.";
  }
  if (code === "ER_ACCESS_DENIED_ERROR" || code === "ER_DBACCESS_DENIED_ERROR") {
    return "Accès MySQL refusé. Vérifiez DB_USER et DB_PASSWORD dans server/.env.";
  }
  if (code === "ER_BAD_DB_ERROR") {
    return "La base n’existe pas. Créez-la : mysql -u root -p < server/db/init.sql (depuis le projet).";
  }
  if (code === "ER_NO_SUCH_TABLE") {
    return "La table « users » est absente. Importez le schéma : mysql -u root -p < server/db/init.sql";
  }
  if (code === "ER_BAD_FIELD_ERROR" || code === "ER_WRONG_VALUE_COUNT_ON_ROW") {
    return "Schéma base incompatible. Réimportez init.sql ou exécutez server/db/migration_auth.sql.";
  }
  return null;
}

/** Détail technique en dev uniquement (pour le débogage). */
export function devSqlHint(err) {
  if (process.env.NODE_ENV === "production") return "";
  const msg = err?.sqlMessage;
  if (typeof msg === "string" && msg.length > 0 && msg.length < 400) {
    return ` (${msg})`;
  }
  return "";
}
