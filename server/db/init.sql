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
  review_count INT NOT NULL DEFAULT 0,
  price_label VARCHAR(64) NOT NULL,
  price_from_eur INT NOT NULL DEFAULT 0,
  price_was_label VARCHAR(64) NULL,
  tag VARCHAR(64) NOT NULL,
  availability VARCHAR(64) NOT NULL DEFAULT 'Disponible',
  deal_badge VARCHAR(64) NULL,
  viewers_recent INT NULL,
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
  action_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target_key VARCHAR(128) NOT NULL COMMENT 'dest:slug ou sugg:id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_target (user_id, target_key),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE user_favorites;
TRUNCATE TABLE notifications;
TRUNCATE TABLE hero_searches;
TRUNCATE TABLE ai_suggestions;
TRUNCATE TABLE map_markers;
TRUNCATE TABLE destinations;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO destinations (slug, name, country, rating, review_count, price_label, price_from_eur, price_was_label, tag, availability, deal_badge, viewers_recent, sort_order) VALUES
  ('santorini', 'Santorin', 'Grèce', 4.8, 1842, 'À partir de 890€', 890, '1 050€', 'Populaire', 'Places limitées', 'Offre Genius', 28, 1),
  ('kyoto', 'Kyoto', 'Japon', 4.9, 3201, 'À partir de 1 240€', 1240, NULL, 'Culturel', 'Disponible', 'Très demandé', 41, 2),
  ('marrakech', 'Marrakech', 'Maroc', 4.7, 956, 'À partir de 520€', 520, '640€', 'Aventure', 'Bientôt complet', 'Prix réduit', 12, 3),
  ('patagonia', 'Patagonie', 'Argentine', 4.9, 523, 'À partir de 1 680€', 1680, NULL, 'Nature', 'Disponible', NULL, 7, 4),
  ('lisbon', 'Lisbonne', 'Portugal', 4.8, 2100, 'À partir de 450€', 450, '520€', 'City trip', 'Disponible', 'Bon plan', 34, 5),
  ('porto', 'Porto', 'Portugal', 4.7, 892, 'À partir de 380€', 380, NULL, 'Romantique', 'Disponible', NULL, 15, 6);

INSERT INTO map_markers (name, lat, lng, info, sort_order) VALUES
  ('Santorin', 36.3932000, 25.4615000, 'Grèce · 4.8★', 1),
  ('Kyoto', 35.0116000, 135.7681000, 'Japon · 4.9★', 2),
  ('Marrakech', 31.6295000, -7.9811000, 'Maroc · 4.7★', 3),
  ('Patagonie', -50.3402000, -72.2648000, 'Argentine · 4.9★', 4),
  ('Lisbonne', 38.7223000, -9.1393000, 'Portugal · 4.8★', 5),
  ('Porto', 41.1579000, -8.6291000, 'Portugal · 4.7★', 6),
  ('Barcelone', 41.3851000, 2.1734000, 'Espagne · 4.8★', 7),
  ('Reykjavik', 64.1466000, -21.9426000, 'Islande · 4.9★', 8),
  ('Dubrovnik', 42.6507000, 18.0944000, 'Croatie · 4.7★', 9),
  ('Copenhague', 55.6761000, 12.5683000, 'Danemark · 4.8★', 10),
  ('Bali', -8.5069000, 115.2625000, 'Indonésie · 4.8★', 11);

INSERT INTO ai_suggestions (type, title, description, duration, keywords) VALUES
  ('itinéraire', '3 jours à Lisbonne', 'Alfama le matin, Time Out Market à midi, coucher de soleil au Miradouro da Graça. Le lendemain, tram 28 et Belém.', '3 jours', 'lisbonne portugal alfama'),
  ('restaurant', 'O Velho Eurico', 'Cuisine portugaise authentique dans une ancienne épicerie. Le bacalhau à brás est inoubliable. Réservez pour le dîner.', '$$', 'lisbonne restaurant portugal'),
  ('itinéraire', 'Weekend à Porto', 'Caves de Vila Nova de Gaia, librairie Lello, puis croisière sur le Douro. Goûtez les francesinha chez Café Santiago.', '2 jours', 'porto douro portugal'),
  ('restaurant', 'Cantinho do Avillez', 'Le bistro du chef étoilé José Avillez. Ambiance décontractée, tapas créatives et vins du Douro exceptionnels.', '$$$', 'lisbonne avillez restaurant'),
  ('itinéraire', 'Santorin en 4 jours', 'Fira, Oia, plages de sable noir, catamaran au coucher du soleil et vin local assyrtiko.', '4 jours', 'santorin grèce cyclades'),
  ('restaurant', 'Selene', 'Table gastronomique à Fira : cuisine crétoise revisitée et vue sur la caldera. Réserver à l’avance en haute saison.', '$$$', 'santorin restaurant grèce'),
  ('itinéraire', 'Kyoto : temples et bambous', 'Kinkaku-ji, Ryoan-ji, Arashiyama en une journée ; le lendemain Fushimi Inari tôt le matin.', '2 jours', 'kyoto japon temple'),
  ('restaurant', 'Gion Karyo', 'Kaiseki traditionnel dans une maison de thé : saisonnalité et présentation impeccable.', '$$$$', 'kyoto kaiseki japon'),
  ('itinéraire', 'Marrakech médina & Atlas', 'Souks, Jardin Majorelle, soirée place Jemaa ; excursion Ourika ou villages berbères.', '3 jours', 'marrakech maroc médina'),
  ('restaurant', 'La Maison Arabe', 'Couscous et tajines raffinés dans un cadre de riad. Piscine et cours de cuisine possibles.', '$$$', 'marrakech restaurant'),
  ('itinéraire', 'Patagonie : glaciers', 'El Calafate, Perito Moreno, navigation lac Argentino ; prévoir coupe-vent et journées longues.', '4 jours', 'patagonie argentine glacier'),
  ('itinéraire', 'Road trip Lisbonne – Porto', 'Tram 28, Belém, Sintra ; puis train vers Porto, caves et pont Dom Luís.', '5 jours', 'lisbonne porto portugal');

INSERT INTO hero_searches (user_id, query_text) VALUES
  (NULL, 'voyage Portugal Lisbonne Porto 1 semaine'),
  (NULL, 'santorini hôtel vue mer juillet'),
  (NULL, 'Japon Kyoto printemps cerisiers'),
  (NULL, 'Maroc Marrakech désert 4 jours'),
  (NULL, 'Patagonie trekking budget'),
  (NULL, 'Islande aurores boréales février'),
  (NULL, 'Barcelone week-end famille'),
  (NULL, 'Croatie Dubrovnik croisière');
