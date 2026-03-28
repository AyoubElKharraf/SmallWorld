-- Enrichissement démo : destinations Portugal, marqueurs carte, suggestions IA, recherches hero.
-- À exécuter sur une base déjà initialisée (après init.sql ou équivalent).
-- Usage : mysql -u root -p smallworld < server/db/migration_20260328_demo_enrichment.sql
-- Les destinations utilisent INSERT IGNORE (slug unique) pour éviter les doublons si relancé.

USE smallworld;

-- Destinations alignées avec Lisbonne / Porto (déjà sur la carte dans map_markers)
INSERT IGNORE INTO destinations (slug, name, country, rating, review_count, price_label, price_from_eur, price_was_label, tag, availability, deal_badge, viewers_recent, sort_order) VALUES
  ('lisbon', 'Lisbonne', 'Portugal', 4.8, 2100, 'À partir de 450€', 450, '520€', 'City trip', 'Disponible', 'Bon plan', 34, 5),
  ('porto', 'Porto', 'Portugal', 4.7, 892, 'À partir de 380€', 380, NULL, 'Romantique', 'Disponible', NULL, 15, 6);

-- Nouveaux repères carte (villes supplémentaires)
INSERT INTO map_markers (name, lat, lng, info, sort_order) VALUES
  ('Barcelone', 41.3851000, 2.1734000, 'Espagne · 4.8★', 7),
  ('Reykjavik', 64.1466000, -21.9426000, 'Islande · 4.9★', 8),
  ('Dubrovnik', 42.6507000, 18.0944000, 'Croatie · 4.7★', 9),
  ('Copenhague', 55.6761000, 12.5683000, 'Danemark · 4.8★', 10),
  ('Bali', -8.5069000, 115.2625000, 'Indonésie · 4.8★', 11);

-- Suggestions IA (assistant + grille locale)
INSERT INTO ai_suggestions (type, title, description, duration, keywords) VALUES
  ('itinéraire', 'Santorin en 4 jours', 'Fira, Oia, plages de sable noir, catamaran au coucher du soleil et vin local assyrtiko.', '4 jours', 'santorin grèce cyclades'),
  ('restaurant', 'Selene', 'Table gastronomique à Fira : cuisine crétoise revisitée et vue sur la caldera. Réserver à l’avance en haute saison.', '$$$', 'santorin restaurant grèce'),
  ('itinéraire', 'Kyoto : temples et bambous', 'Kinkaku-ji, Ryoan-ji, Arashiyama en une journée ; le lendemain Fushimi Inari tôt le matin.', '2 jours', 'kyoto japon temple'),
  ('restaurant', 'Gion Karyo', 'Kaiseki traditionnel dans une maison de thé : saisonnalité et présentation impeccable.', '$$$$', 'kyoto kaiseki japon'),
  ('itinéraire', 'Marrakech médina & Atlas', 'Souks, Jardin Majorelle, soirée place Jemaa ; excursion Ourika ou villages berbères.', '3 jours', 'marrakech maroc médina'),
  ('restaurant', 'La Maison Arabe', 'Couscous et tajines raffinés dans un cadre de riad. Piscine et cours de cuisine possibles.', '$$$', 'marrakech restaurant'),
  ('itinéraire', 'Patagonie : glaciers', 'El Calafate, Perito Moreno, navigation lac Argentino ; prévoir coupe-vent et journées longues.', '4 jours', 'patagonie argentine glacier'),
  ('itinéraire', 'Road trip Lisbonne – Porto', 'Tram 28, Belém, Sintra ; puis train vers Porto, caves et pont Dom Luís.', '5 jours', 'lisbonne porto portugal');

-- Recherches hero (sans utilisateur) : alimente l’historique admin / démo
INSERT INTO hero_searches (user_id, query_text) VALUES
  (NULL, 'voyage Portugal Lisbonne Porto 1 semaine'),
  (NULL, 'santorini hôtel vue mer juillet'),
  (NULL, 'Japon Kyoto printemps cerisiers'),
  (NULL, 'Maroc Marrakech désert 4 jours'),
  (NULL, 'Patagonie trekking budget'),
  (NULL, 'Islande aurores boréales février'),
  (NULL, 'Barcelone week-end famille'),
  (NULL, 'Croatie Dubrovnik croisière');
