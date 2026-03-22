import { Utensils, Route, type LucideIcon } from "lucide-react";
import { apiUrl } from "@/lib/api";

export type Suggestion = {
  type: "itinéraire" | "restaurant" | string;
  title: string;
  description: string;
  duration: string;
  details?: string;
};

export type SuggestionsResponse = { suggestions: Suggestion[] };

export const FALLBACK_SUGGESTIONS: Suggestion[] = [
  {
    type: "itinéraire",
    title: "3 jours à Lisbonne",
    description:
      "Alfama le matin, Time Out Market à midi, coucher de soleil au Miradouro da Graça. Le lendemain, tram 28 et Belém.",
    duration: "3 jours",
    details:
      "Jour 1 — Alfama & Baixa : montée tranquille dans l’Alfama, café dans une ruelle, déjeuner au Time Out Market (halles regroupant les meilleures adresses). Fin de journée au Miradouro da Graça pour le coucher de soleil.\n\n" +
      "Jour 2 — Belém & Ouest : tram 28 (évitez les heures de pointe), Tour de Belém et Mosteiro dos Jerónimos le matin. Goûter aux pastéis de Belém.\n\n" +
      "Jour 3 — LX Factory & rives : quartier créatif, boutiques design, dernière balade le long du Tage.",
  },
  {
    type: "restaurant",
    title: "O Velho Eurico",
    description:
      "Cuisine portugaise authentique dans une ancienne épicerie. Le bacalhau à brás est inoubliable. Réservez pour le dîner.",
    duration: "$$",
    details:
      "Petite salle, carte courte et produits du marché. Arrivez tôt ou réservez : peu de places. Essayez le bacalhau à brás et un vin du Douro au verre. Ambiance familiale, service direct — idéal après une journée dans l’Alfama.",
  },
  {
    type: "itinéraire",
    title: "Weekend à Porto",
    description:
      "Caves de Vila Nova de Gaia, librairie Lello, puis croisière sur le Douro. Goûtez les francesinha chez Café Santiago.",
    duration: "2 jours",
    details:
      "Samedi : caves (réservez une dégustation), traversée du pont Dom Luís I, librairie Lello le goûter pour éviter la foule.\n\n" +
      "Dimanche : croisière courte sur le Douro (matin), quartier de Ribeira pour déjeuner, francesinha au Café Santiago le midi (portion généreuse — partagez !).",
  },
  {
    type: "restaurant",
    title: "Cantinho do Avillez",
    description:
      "Le bistro du chef étoilé José Avillez. Ambiance décontractée, tapas créatives et vins du Douro exceptionnels.",
    duration: "$$$",
    details:
      "Carte type « petites assiettes » pour partager. Demandez l’accord mets-vins : la cave met en avant le Douro et le Vinho Verde. Réserver impérativement le week-end. Tenue décontractée acceptée malgré le nom du chef.",
  },
];

export function filterSuggestionsLocal(items: Suggestion[], q: string): Suggestion[] {
  const trimmed = q.trim();
  if (!trimmed) return items;
  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = items.map((s) => {
    const hay = `${s.title} ${s.description}`.toLowerCase();
    const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const picked = scored.filter((x) => x.score > 0);
  const list = picked.length ? picked : scored;
  return list.slice(0, 8).map((x) => x.s);
}

export async function fetchSuggestions(q: string): Promise<SuggestionsResponse> {
  const url = apiUrl(`/api/suggestions?q=${encodeURIComponent(q)}`);
  const r = await fetch(url);
  if (!r.ok) throw new Error("suggestions");
  return r.json();
}

export function iconForLabel(type: string): LucideIcon {
  return type === "restaurant" ? Utensils : Route;
}

export function resolveDetails(s: Suggestion): string {
  if (s.details?.trim()) return s.details.trim();
  const fromFallback = FALLBACK_SUGGESTIONS.find((x) => x.title === s.title)?.details;
  if (fromFallback) return fromFallback;
  if (s.type === "restaurant") {
    return `À retenir pour « ${s.title} » :\n\n${s.description}\n\nPensez à réserver, surtout le vendredi et samedi soir. Vérifiez les horaires d’ouverture (certaines cuisines ferment entre le déjeuner et le dîner).`;
  }
  return `Pour « ${s.title} » :\n\n${s.description}\n\nAdaptez les horaires à la saison et à la météo. Les monuments les plus visités se réservent souvent en ligne.`;
}
