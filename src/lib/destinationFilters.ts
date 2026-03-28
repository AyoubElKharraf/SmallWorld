import type { DestinationRow } from "@/lib/destinations-data";

export type SortId = "recommended" | "price_asc" | "price_desc" | "rating_desc" | "name_asc";
export type PriceRangeId = "all" | "lt600" | "600_1500" | "gt1500";
export type ViewModeId = "grid" | "list";

const SORT_IDS: SortId[] = ["recommended", "price_asc", "price_desc", "rating_desc", "name_asc"];
const PRICE_IDS: PriceRangeId[] = ["all", "lt600", "600_1500", "gt1500"];

export function parseSortParam(s: string | null): SortId {
  return s && SORT_IDS.includes(s as SortId) ? (s as SortId) : "recommended";
}

export function parsePriceParam(s: string | null): PriceRangeId {
  return s && PRICE_IDS.includes(s as PriceRangeId) ? (s as PriceRangeId) : "all";
}

export function parseViewParam(s: string | null): ViewModeId {
  return s === "list" ? "list" : "grid";
}

export function effectivePriceEur(d: DestinationRow): number {
  if (typeof d.price_from_eur === "number" && d.price_from_eur > 0) return d.price_from_eur;
  const fromLabel = parsePriceFromLabel(d.price);
  return fromLabel ?? 999999;
}

function parsePriceFromLabel(price: string | undefined): number | null {
  if (!price) return null;
  const compact = price.replace(/\s/g, " ");
  const m = compact.match(/(\d[\d\s]*)\s*€/);
  if (m) return parseInt(m[1].replace(/\s/g, ""), 10);
  const m2 = compact.match(/(\d{2,})/);
  return m2 ? parseInt(m2[1].replace(/\s/g, ""), 10) : null;
}

export function destinationMatchesQuery(d: DestinationRow, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = `${d.name} ${d.country} ${d.slug}`.toLowerCase();
  return hay.includes(s);
}

export function destinationMatchesPriceRange(d: DestinationRow, range: PriceRangeId): boolean {
  const p = effectivePriceEur(d);
  if (range === "all") return true;
  if (range === "lt600") return p < 600;
  if (range === "600_1500") return p >= 600 && p <= 1500;
  return p > 1500;
}

export function buildRecommendedIndex(rows: DestinationRow[]): Map<string, number> {
  const m = new Map<string, number>();
  rows.forEach((d, i) => m.set(d.slug, i));
  return m;
}

export function sortDestinations(
  rows: DestinationRow[],
  sort: SortId,
  recommendedIndex: Map<string, number>
): DestinationRow[] {
  const copy = [...rows];
  if (sort === "recommended") {
    copy.sort((a, b) => (recommendedIndex.get(a.slug) ?? 0) - (recommendedIndex.get(b.slug) ?? 0));
    return copy;
  }
  if (sort === "price_asc") {
    copy.sort((a, b) => effectivePriceEur(a) - effectivePriceEur(b));
    return copy;
  }
  if (sort === "price_desc") {
    copy.sort((a, b) => effectivePriceEur(b) - effectivePriceEur(a));
    return copy;
  }
  if (sort === "rating_desc") {
    copy.sort((a, b) => Number(b.rating) - Number(a.rating));
    return copy;
  }
  copy.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return copy;
}
