-- Statut type « disponibilité » sur les destinations (démo produit).
-- mysql -u root -p smallworld < server/db/migration_20260328_destinations_availability.sql

USE smallworld;

ALTER TABLE destinations
  ADD COLUMN availability VARCHAR(64) NOT NULL DEFAULT 'Disponible' AFTER tag;

UPDATE destinations SET availability = 'Places limitées' WHERE slug = 'santorini';
UPDATE destinations SET availability = 'Disponible' WHERE slug IN ('kyoto', 'patagonia');
UPDATE destinations SET availability = 'Bientôt complet' WHERE slug = 'marrakech';
