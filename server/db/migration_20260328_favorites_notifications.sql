-- Migrations incrémentales (base déjà existante).
-- mysql -u root -p smallworld < server/db/migration_20260328_favorites_notifications.sql
-- Si erreur « Duplicate column » : la colonne existe déjà, ignorez.

USE smallworld;

ALTER TABLE notifications
  ADD COLUMN action_url VARCHAR(512) NULL;

CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target_key VARCHAR(128) NOT NULL COMMENT 'dest:slug ou sugg:id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_target (user_id, target_key),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
