export type DestinationRow = {
  slug: string;
  name: string;
  country: string;
  rating: number | string;
  price: string;
  tag: string;
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
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japon",
    rating: 4.9,
    price: "À partir de 1 240€",
    tag: "Culturel",
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Maroc",
    rating: 4.7,
    price: "À partir de 520€",
    tag: "Aventure",
  },
  {
    slug: "patagonia",
    name: "Patagonie",
    country: "Argentine",
    rating: 4.9,
    price: "À partir de 1 680€",
    tag: "Nature",
  },
];

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
};

export function itineraryForSlug(slug: string, destinationName: string): string {
  const specific = DESTINATION_ITINERARY[slug]?.trim();
  if (specific) return specific;
  return (
    `Itinéraire type pour « ${destinationName} » : prévoyez 3 à 5 jours pour explorer la région à votre rythme, ` +
    "en mélangeant sites emblématiques et quartiers locaux. Adaptez les horaires à la saison et à la météo."
  );
}
