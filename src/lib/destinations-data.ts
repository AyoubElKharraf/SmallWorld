export type DestinationRow = {
  slug: string;
  name: string;
  country: string;
  rating: number | string;
  price: string;
  tag: string;
  /** Libellé métier type « disponible / places limitées » (démo). */
  availability?: string;
  review_count?: number;
  price_from_eur?: number;
  price_was_label?: string | null;
  deal_badge?: string | null;
  viewers_recent?: number | null;
  sort_order?: number;
};

/** Aligné sur `server/db/init.sql` — affiché si l’API / MySQL est indisponible. */
export const FALLBACK_DESTINATIONS: DestinationRow[] = [
  {
    slug: "santorini",
    name: "Santorin",
    country: "Grèce",
    rating: 4.8,
    price: "À partir de 890€",
    tag: "Populaire",
    availability: "Places limitées",
    review_count: 1842,
    price_from_eur: 890,
    price_was_label: "1 050€",
    deal_badge: "Offre Genius",
    viewers_recent: 28,
    sort_order: 1,
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japon",
    rating: 4.9,
    price: "À partir de 1 240€",
    tag: "Culturel",
    availability: "Disponible",
    review_count: 3201,
    price_from_eur: 1240,
    price_was_label: null,
    deal_badge: "Très demandé",
    viewers_recent: 41,
    sort_order: 2,
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Maroc",
    rating: 4.7,
    price: "À partir de 520€",
    tag: "Aventure",
    availability: "Bientôt complet",
    review_count: 956,
    price_from_eur: 520,
    price_was_label: "640€",
    deal_badge: "Prix réduit",
    viewers_recent: 12,
    sort_order: 3,
  },
  {
    slug: "patagonia",
    name: "Patagonie",
    country: "Argentine",
    rating: 4.9,
    price: "À partir de 1 680€",
    tag: "Nature",
    availability: "Disponible",
    review_count: 523,
    price_from_eur: 1680,
    price_was_label: null,
    deal_badge: null,
    viewers_recent: 7,
    sort_order: 4,
  },
  {
    slug: "lisbon",
    name: "Lisbonne",
    country: "Portugal",
    rating: 4.8,
    price: "À partir de 450€",
    tag: "City trip",
    availability: "Disponible",
    review_count: 2100,
    price_from_eur: 450,
    price_was_label: "520€",
    deal_badge: "Bon plan",
    viewers_recent: 34,
    sort_order: 5,
  },
  {
    slug: "porto",
    name: "Porto",
    country: "Portugal",
    rating: 4.7,
    price: "À partir de 380€",
    tag: "Romantique",
    availability: "Disponible",
    review_count: 892,
    price_from_eur: 380,
    price_was_label: null,
    deal_badge: null,
    viewers_recent: 15,
    sort_order: 6,
  },
];

/** Classes pour badges de statut (aligné sur les libellés seed / admin). */
export function availabilityTone(label: string | undefined): "ok" | "warn" | "alert" | "muted" {
  const s = (label ?? "").toLowerCase();
  if (s.includes("bientôt") || s.includes("complet")) return "alert";
  if (s.includes("limit")) return "warn";
  if (s.includes("dispon")) return "ok";
  return "muted";
}

/** Texte « itinéraire » affiché sur la page détail (hors base pour l’instant). */
export const DESTINATION_ITINERARY: Record<string, string> = {
  santorini:
    "Jour 1 — Fira et caldera : promenade le long des falaises, musée préhistorique, dîner face à la mer.\n\n" +
    "Jour 2 — Oia : ruelles blanches et bleues, coucher de soleil sur le fort, cave locale pour un vin assyrtiko.\n\n" +
    "Jour 3 — Plages et Akrotiri : sable noir (Perissa), site minoen couvert, option catamaran au coucher du soleil.",
  kyoto:
    "Jour 1 — Centre historique : Nijo, marché Nishiki, soirée dans Gion.\n\n" +
    "Jour 2 — Arashiyama : bambouseraie, rivière, temple Tenryū-ji.\n\n" +
    "Jour 3 — Fushimi Inari le matin (tôt), puis quartier Higashiyama et Kiyomizu-dera.",
  marrakech:
    "Jour 1 — Médina et Jemaa el-Fna : souks, terrasse au coucher du soleil, ambiance nocturne.\n\n" +
    "Jour 2 — Jardins Majorelle, musée YSL, puis hammam et cuisine marocaine.\n\n" +
    "Jour 3 — Excursion Atlas ou Ourika (selon saison), retour détente au riad.",
  patagonia:
    "Jour 1 — El Calafate : découverte du village, lac Argentino.\n\n" +
    "Jour 2 — Perito Moreno : passerelles et navigation optionnelle.\n\n" +
    "Jour 3 — Trek ou navigation selon météo ; prévoir couches chaudes et vent.",
  lisbon:
    "Jour 1 — Alfama et Baixa : tram 28, château, Miradouro da Graça. Soirée fado.\n\n" +
    "Jour 2 — Belém : tour, monuments, pastéis de nata. Time Out Market pour le déjeuner.\n\n" +
    "Jour 3 — Sintra en excursion (Pena, Quinta da Regaleira) ou plages de Cascais.",
  porto:
    "Jour 1 — Ribeira et pont Dom Luís : quartier historique, croisière sur le Douro au coucher du soleil.\n\n" +
    "Jour 2 — Caves de Vila Nova de Gaia, librairie Lello, café Majestic.\n\n" +
    "Jour 3 — Plage de Foz ou Matosinhos (fruits de mer) ; dégustation de porto.",
};

export function itineraryForSlug(slug: string, destinationName: string): string {
  const specific = DESTINATION_ITINERARY[slug]?.trim();
  if (specific) return specific;
  return (
    `Itinéraire type pour « ${destinationName} » : prévoyez 3 à 5 jours pour explorer la région à votre rythme, ` +
    "en mélangeant sites emblématiques et quartiers locaux. Adaptez les horaires à la saison et à la météo."
  );
}
