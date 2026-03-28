import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowRight, Eye, LayoutGrid, LayoutList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { destinationImages } from "@/lib/destinationImages";
import { apiUrl } from "@/lib/api";
import { FALLBACK_DESTINATIONS, type DestinationRow } from "@/lib/destinations-data";
import {
  buildRecommendedIndex,
  destinationMatchesPriceRange,
  destinationMatchesQuery,
  parsePriceParam,
  parseSortParam,
  parseViewParam,
  sortDestinations,
  type PriceRangeId,
  type SortId,
  type ViewModeId,
} from "@/lib/destinationFilters";
import { ErrorStatePanel } from "@/components/ErrorStatePanel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell } from "@/components/layout/PageShell";
import { BookingDemoDialog } from "@/components/BookingDemoDialog";
import { DestinationsResultsMap } from "@/components/DestinationsResultsMap";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const fetchDestinations = async (): Promise<DestinationRow[]> => {
  const r = await fetch(apiUrl("/api/destinations"));
  if (!r.ok) throw new Error("destinations");
  return r.json();
};

const DestinationsGrid = () => {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const sortBy = parseSortParam(params.get("sort"));
  const priceRange = parsePriceParam(params.get("price"));
  const viewMode = parseViewParam(params.get("view"));

  const setSort = (s: SortId) => {
    const next = new URLSearchParams(params);
    if (s === "recommended") next.delete("sort");
    else next.set("sort", s);
    setParams(next);
  };

  const setPriceRange = (p: PriceRangeId) => {
    const next = new URLSearchParams(params);
    if (p === "all") next.delete("price");
    else next.set("price", p);
    setParams(next);
  };

  const setViewMode = (v: ViewModeId) => {
    const next = new URLSearchParams(params);
    if (v === "grid") next.delete("view");
    else next.set("view", "list");
    setParams(next);
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    retry: 2,
    retryDelay: 800,
  });

  const displayRows = useMemo(
    () => (isError ? FALLBACK_DESTINATIONS : (data ?? [])),
    [isError, data]
  );
  const [filterTag, setFilterTag] = useState<string>("all");

  const recommendedIndex = useMemo(() => buildRecommendedIndex(displayRows), [displayRows]);

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    for (const d of displayRows) {
      if (d.tag?.trim()) set.add(d.tag.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [displayRows]);

  const filteredRows = useMemo(() => {
    let rows = displayRows.filter((d) => destinationImages[d.slug]);
    if (filterTag !== "all") rows = rows.filter((d) => d.tag === filterTag);
    rows = rows.filter((d) => destinationMatchesQuery(d, q));
    rows = rows.filter((d) => destinationMatchesPriceRange(d, priceRange));
    return sortDestinations(rows, sortBy, recommendedIndex);
  }, [displayRows, filterTag, q, priceRange, sortBy, recommendedIndex]);

  const locale = i18n.language?.startsWith("en") ? "en-US" : "fr-FR";

  const priceChipClass = (id: PriceRangeId) =>
    cn(
      "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition",
      priceRange === id
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:bg-muted"
    );

  return (
    <PageShell className="py-12 md:py-16" variant="default">
      <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.15em] text-accent">
          {t("destinationsGrid.resultsKicker")}
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-serif text-4xl leading-[1.1] text-balance text-foreground md:text-5xl">
            {t("destinationsGrid.resultsTitle")}
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => {
                if (v === "grid" || v === "list") setViewMode(v);
              }}
              variant="outline"
              size="sm"
              aria-label={t("destinationsGrid.viewToggleAria")}
              className="gap-0 rounded-lg border border-input bg-background p-0.5"
            >
              <ToggleGroupItem
                value="grid"
                aria-label={t("destinationsGrid.viewGridAria")}
                className="rounded-md px-2.5 data-[state=on]:bg-accent"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label={t("destinationsGrid.viewListAria")}
                className="rounded-md px-2.5 data-[state=on]:bg-accent"
              >
                <LayoutList className="h-4 w-4" aria-hidden />
              </ToggleGroupItem>
            </ToggleGroup>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                {t("destinationsGrid.resultCount", { count: filteredRows.length })}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <aside
          aria-label={t("destinationsGrid.filtersAsideAria")}
          className="space-y-6 rounded-2xl border border-border/70 bg-card/50 p-4 shadow-sm lg:sticky lg:top-20 lg:w-[272px] lg:shrink-0 lg:self-start lg:p-5"
        >
          <h3 className="font-serif text-lg text-foreground">{t("destinationsGrid.filtersTitle")}</h3>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("destinationsGrid.sortLabel")}
            </span>
            <Select value={sortBy} onValueChange={(v) => setSort(v as SortId)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">{t("destinationsGrid.sortRecommended")}</SelectItem>
                <SelectItem value="price_asc">{t("destinationsGrid.sortPriceAsc")}</SelectItem>
                <SelectItem value="price_desc">{t("destinationsGrid.sortPriceDesc")}</SelectItem>
                <SelectItem value="rating_desc">{t("destinationsGrid.sortRating")}</SelectItem>
                <SelectItem value="name_asc">{t("destinationsGrid.sortName")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("destinationsGrid.priceLabel")}
            </span>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
              <button
                type="button"
                className={cn(priceChipClass("all"), "lg:w-full")}
                onClick={() => setPriceRange("all")}
              >
                {t("destinationsGrid.priceAll")}
              </button>
              <button
                type="button"
                className={cn(priceChipClass("lt600"), "lg:w-full")}
                onClick={() => setPriceRange("lt600")}
              >
                {t("destinationsGrid.priceLt600")}
              </button>
              <button
                type="button"
                className={cn(priceChipClass("600_1500"), "lg:w-full")}
                onClick={() => setPriceRange("600_1500")}
              >
                {t("destinationsGrid.price6001500")}
              </button>
              <button
                type="button"
                className={cn(priceChipClass("gt1500"), "lg:w-full")}
                onClick={() => setPriceRange("gt1500")}
              >
                {t("destinationsGrid.priceGt1500")}
              </button>
            </div>
          </div>

          {tagOptions.length > 0 && (
            <div className="space-y-2" role="group" aria-label={t("destinationsGrid.tagSectionLabel")}>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("destinationsGrid.tagSectionLabel")}
              </span>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                <button
                  type="button"
                  onClick={() => setFilterTag("all")}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition lg:w-full",
                    filterTag === "all"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t("destinationsGrid.filterAll")}
                </button>
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilterTag(tag)}
                    className={cn(
                      "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition lg:w-full",
                      filterTag === tag
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {isError && (
            <div className="space-y-2">
              <ErrorStatePanel
                variant="inline"
                title="Impossible de charger les destinations depuis le serveur."
                description="Vérifiez que l’API tourne et que MySQL est accessible. Les résultats ci-dessous affichent des données de démonstration."
                onRetry={() => refetch()}
                isRetrying={isFetching}
              />
            </div>
          )}

          {isLoading && !isError && viewMode === "grid" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/5" />
                      <Skeleton className="h-4 w-2/5" />
                    </div>
                    <Skeleton className="h-5 w-10 shrink-0" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {isLoading && !isError && viewMode === "list" && (
            <ul className="space-y-3" role="list">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/30 p-3 sm:flex-row sm:items-stretch">
                  <Skeleton className="h-44 w-full shrink-0 rounded-xl sm:h-32 sm:w-44" />
                  <div className="min-w-0 flex flex-1 flex-col justify-center gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48 max-w-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-16 shrink-0" />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && filteredRows.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("destinationsGrid.emptyFilter")}</p>
          )}

          {!isLoading && filteredRows.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((dest, i) => {
            const src = destinationImages[dest.slug];
            const to = `/destination/${encodeURIComponent(dest.slug)}`;
            const ratingNum =
              typeof dest.rating === "number" ? dest.rating : Number(dest.rating);
            const reviews = dest.review_count;
            return (
              <motion.div
                key={dest.slug}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative h-full"
              >
                <FavoriteButton
                  targetKey={`dest:${dest.slug}`}
                  className="absolute right-3 top-3 z-20"
                />
                <Link
                  to={to}
                  aria-label={`Voir l’itinéraire : ${dest.name}, ${dest.country}`}
                  className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-2xl">
                    <img
                      src={src}
                      alt={`${dest.name}, ${dest.country}`}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-6rem)] flex-col gap-2">
                      <span className="w-fit rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                        {dest.tag}
                      </span>
                      {dest.deal_badge && (
                        <span className="w-fit rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {dest.deal_badge}
                        </span>
                      )}
                    </div>
                    {dest.availability && (
                      <div className="absolute right-3 top-14 z-10 max-w-[calc(100%-5rem)]">
                        <AvailabilityBadge label={dest.availability} />
                      </div>
                    )}
                    {typeof dest.viewers_recent === "number" && dest.viewers_recent > 0 && (
                      <div className="absolute bottom-3 left-3 z-10 flex max-w-[min(100%,14rem)] items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[0.7rem] text-muted-foreground backdrop-blur-sm">
                        <Eye className="h-3 w-3 shrink-0" aria-hidden />
                        <span className="line-clamp-2 leading-tight">
                          {t("destinationsGrid.viewersRecent", { count: dest.viewers_recent })}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 flex translate-y-2 items-center justify-between opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-sm font-medium text-primary-foreground">
                        {t("destinationsGrid.ctaItinerary")}
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary-foreground" aria-hidden />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl text-foreground">{dest.name}</h3>
                      <p className="text-sm text-muted-foreground">{dest.country}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                        <span className="font-medium tabular-nums text-foreground">{ratingNum}</span>
                      </div>
                      {typeof reviews === "number" && reviews > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t("destinationsGrid.reviewsShort", {
                            count: reviews,
                            formatted: reviews.toLocaleString(locale),
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      {dest.price_was_label && (
                        <span className="text-sm text-muted-foreground line-through">
                          {dest.price_was_label}
                        </span>
                      )}
                      <span className="text-base font-semibold text-foreground">{dest.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("destinationsGrid.priceFootnote")}</p>
                  </div>
                </Link>
                <div className="mt-2 flex justify-end">
                  <BookingDemoDialog
                    variant="card"
                    destinationName={dest.name}
                    priceLabel={dest.price}
                    availabilityLabel={dest.availability}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
          )}

          {!isLoading && filteredRows.length > 0 && viewMode === "list" && (
            <ul className="space-y-4" role="list">
              {filteredRows.map((dest, i) => {
                const src = destinationImages[dest.slug];
                const to = `/destination/${encodeURIComponent(dest.slug)}`;
                const ratingNum =
                  typeof dest.rating === "number" ? dest.rating : Number(dest.rating);
                const reviews = dest.review_count;
                return (
                  <motion.li
                    key={dest.slug}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.45,
                      delay: i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative list-none"
                  >
                    <FavoriteButton
                      targetKey={`dest:${dest.slug}`}
                      className="absolute right-3 top-3 z-20"
                    />
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
                    <Link
                      to={to}
                      aria-label={`Voir l’itinéraire : ${dest.name}, ${dest.country}`}
                      className="group flex flex-col gap-4 p-3 transition-colors hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-stretch sm:gap-5 sm:p-4"
                    >
                      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl sm:h-[9.5rem] sm:w-[12.5rem]">
                        <img
                          src={src}
                          alt={`${dest.name}, ${dest.country}`}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-4rem)] flex-col gap-1.5">
                          {dest.tag && (
                            <span className="w-fit rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                              {dest.tag}
                            </span>
                          )}
                          {dest.deal_badge && (
                            <span className="w-fit rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                              {dest.deal_badge}
                            </span>
                          )}
                        </div>
                        {dest.availability && (
                          <div className="absolute right-2 top-2 z-10 max-w-[calc(100%-4rem)]">
                            <AvailabilityBadge label={dest.availability} />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-serif text-xl text-foreground">{dest.name}</h3>
                            <p className="text-sm text-muted-foreground">{dest.country}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                              <span className="font-medium tabular-nums text-foreground">{ratingNum}</span>
                            </div>
                            {typeof reviews === "number" && reviews > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {t("destinationsGrid.reviewsShort", {
                                  count: reviews,
                                  formatted: reviews.toLocaleString(locale),
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-border/50 pt-3 sm:flex-row sm:items-end sm:justify-between sm:border-0 sm:pt-0">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              {dest.price_was_label && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {dest.price_was_label}
                                </span>
                              )}
                              <span className="text-lg font-semibold text-foreground">{dest.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{t("destinationsGrid.priceFootnote")}</p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
                            {t("destinationsGrid.ctaItinerary")}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex justify-end border-t border-border/50 bg-card/20 px-4 py-2.5 sm:px-5">
                      <BookingDemoDialog
                        variant="card"
                        destinationName={dest.name}
                        priceLabel={dest.price}
                        availabilityLabel={dest.availability}
                      />
                    </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {!isLoading && filteredRows.length > 0 && (
        <DestinationsResultsMap destinations={filteredRows} />
      )}
      </section>
    </PageShell>
  );
};

export default DestinationsGrid;
