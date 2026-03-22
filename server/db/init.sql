-- Installation initiale : mysql -u root -p < server/db/init.sql
-- Déjà une base sans auth ? Utilisez aussi server/db/migration_auth.sql si besoin.

CREATE DATABASE IF NOT EXISTS smallworld
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smallworld;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(128) NOT NULL,
  role ENUM('client', 'admin') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  country VARCHAR(128) NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  price_label VARCHAR(64) NOT NULL,
  tag VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS map_markers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(11, 7) NOT NULL,
  info VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('itinéraire', 'restaurant') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  duration VARCHAR(32) NOT NULL,
  keywords VARCHAR(512) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hero_searches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  query_text VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hero_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE hero_searches;
TRUNCATE TABLE ai_suggestions;
TRUNCATE TABLE map_markers;
TRUNCATE TABLE destinations;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO destinations (slug, name, country, rating, price_label, tag, sort_order) VALUES
  ('santorini', 'Santorin', 'Grèce', 4.8, 'À partir de 890€', 'Populaire', 1),
  ('kyoto', 'Kyoto', 'Japon', 4.9, 'À partir de 1 240€', 'Culturel', 2),
  ('marrakech', 'Marrakech', 'Maroc', 4.7, 'À partir de 520€', 'Aventure', 3),
  ('patagonia', 'Patagonie', 'Argentine', 4.9, 'À partir de 1 680€', 'Nature', 4);

INSERT INTO map_markers (name, lat, lng, info, sort_order) VALUES
  ('Santorin', 36.3932000, 25.4615000, 'Grèce · 4.8★', 1),
  ('Kyoto', 35.0116000, 135.7681000, 'Japon · 4.9★', 2),
  ('Marrakech', 31.6295000, -7.9811000, 'Maroc · 4.7★', 3),
  ('Patagonie', -50.3402000, -72.2648000, 'Argentine · 4.9★', 4),
  ('Lisbonne', 38.7223000, -9.1393000, 'Portugal · 4.8★', 5),
  ('Porto', 41.1579000, -8.6291000, 'Portugal · 4.7★', 6);

INSERT INTO ai_suggestions (type, title, description, duration, keywords) VALUES
  ('itinéraire', '3 jours à Lisbonne', 'Alfama le matin, Time Out Market à midi, coucher de soleil au Miradouro da Graça. Le lendemain, tram 28 et Belém.', '3 jours', 'lisbonne portugal alfama'),
  ('restaurant', 'O Velho Eurico', 'Cuisine portugaise authentique dans une ancienne épicerie. Le bacalhau à brás est inoubliable. Réservez pour le dîner.', '$$', 'lisbonne restaurant portugal'),
  ('itinéraire', 'Weekend à Porto', 'Caves de Vila Nova de Gaia, librairie Lello, puis croisière sur le Douro. Goûtez les francesinha chez Café Santiago.', '2 jours', 'porto douro portugal'),
  ('restaurant', 'Cantinho do Avillez', 'Le bistro du chef étoilé José Avillez. Ambiance décontractée, tapas créatives et vins du Douro exceptionnels.', '$$$', 'lisbonne avillez restaurant');
