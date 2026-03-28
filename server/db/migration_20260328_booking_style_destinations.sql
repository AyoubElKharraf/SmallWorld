-- Champs type Booking : avis, prix pour tri/filtre, promo, affluence (démo).
-- mysql -u root -p smallworld < server/db/migration_20260328_booking_style_destinations.sql

USE smallworld;

ALTER TABLE destinations
  ADD COLUMN review_count INT NOT NULL DEFAULT 0 AFTER rating,
  ADD COLUMN price_from_eur INT NOT NULL DEFAULT 0 AFTER price_label,
  ADD COLUMN price_was_label VARCHAR(64) NULL AFTER price_from_eur,
  ADD COLUMN deal_badge VARCHAR(64) NULL AFTER availability,
  ADD COLUMN viewers_recent INT NULL AFTER deal_badge;

UPDATE destinations SET
  review_count = 1842, price_from_eur = 890, price_was_label = '1 050€', deal_badge = 'Offre Genius', viewers_recent = 28
  WHERE slug = 'santorini';
UPDATE destinations SET
  review_count = 3201, price_from_eur = 1240, price_was_label = NULL, deal_badge = 'Très demandé', viewers_recent = 41
  WHERE slug = 'kyoto';
UPDATE destinations SET
  review_count = 956, price_from_eur = 520, price_was_label = '640€', deal_badge = 'Prix réduit', viewers_recent = 12
  WHERE slug = 'marrakech';
UPDATE destinations SET
  review_count = 523, price_from_eur = 1680, price_was_label = NULL, deal_badge = NULL, viewers_recent = 7
  WHERE slug = 'patagonia';
