import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Loader2, ArrowRight, Star, Clock } from "lucide-react";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { destinationImages } from "@/lib/destinationImages";
import { iconForLabel } from "@/lib/suggestions-data";
import { ErrorStatePanel } from "@/components/ErrorStatePanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { BookingDemoDialog } from "@/components/BookingDemoDialog";

type FavDestination = {
  slug: string;
  name: string;
  country: string;
  rating: number | string;
  price_label: string;
  tag: string;
  availability?: string;
  review_count?: number;
  price_was_label?: string | null;
  deal_badge?: string | null;
  targetKey: string;
};

type FavSuggestion = {
  id: number;
  type: string;
  title: string;
  description: string;
  duration: string;
  targetKey: string;
};

type FavoritesResponse = {
  targets: string[];
  destinations: FavDestination[];
  suggestions: FavSuggestion[];
};

async function fetchFavorites(): Promise<FavoritesResponse> {
  const r = await apiFetch("/api/favorites");
  if (!r.ok) throw new Error("favorites");
  return r.json();
}

const FavoritesPage = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: fetchFavorites,
  });

  if (isLoading) {
    return (
      <PageShell variant="lg" className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        {t("favorites.loading")}
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell variant="lg" className="min-h-[50vh] pb-16 pt-8">
        <div className="mx-auto max-w-lg">
          <ErrorStatePanel
            title={t("favorites.loadError")}
            description={t("favorites.loadErrorDesc")}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </div>
      </PageShell>
    );
  }

  const empty = data.destinations.length === 0 && data.suggestions.length === 0;

  return (
    <PageShell variant="lg" className="pb-16 pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <PageHeader
          align="center"
          icon={Heart}
          iconClassName="fill-accent text-accent"
          title={t("favorites.title")}
          description={t("favorites.subtitle")}
        />
      </motion.div>

        {empty ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center text-muted-foreground">
            {t("favorites.empty")}
          </p>
        ) : (
          <div className="space-y-12">
            {data.destinations.length > 0 && (
              <section>
                <h2 className="mb-4 font-serif text-xl text-foreground">{t("favorites.sectionDestinations")}</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.destinations.map((dest) => {
                    const src = destinationImages[dest.slug];
                    const locale = i18n.language?.startsWith("en") ? "en-US" : "fr-FR";
                    if (!src) return null;
                    return (
                      <div
                        key={dest.targetKey}
                        className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/20"
                      >
                        <Link
                          to={`/destination/${encodeURIComponent(dest.slug)}`}
                          className="group block text-left"
                        >
                          <div className="relative aspect-[16/10]">
                            <img
                              src={src}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2 py-1 text-xs font-medium">
                              {dest.tag}
                            </span>
                            {dest.availability && (
                              <div className="absolute right-3 top-3 max-w-[calc(100%-5rem)]">
                                <AvailabilityBadge label={dest.availability} />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-serif text-lg text-foreground">{dest.name}</h3>
                                <p className="text-sm text-muted-foreground">{dest.country}</p>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                                {dest.rating}
                              </div>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex flex-wrap items-baseline gap-2">
                                {dest.price_was_label && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {dest.price_was_label}
                                  </span>
                                )}
                                <p className="text-sm text-muted-foreground">{dest.price_label}</p>
                              </div>
                              {dest.review_count != null && dest.review_count > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {t("favorites.reviewLine", {
                                    formatted: dest.review_count.toLocaleString(locale),
                                  })}
                                </p>
                              )}
                            </div>
                            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                              {t("favorites.open")}
                              <ArrowRight className="h-4 w-4" aria-hidden />
                            </span>
                          </div>
                        </Link>
                        <div className="flex justify-end border-t border-border/60 bg-muted/15 px-4 py-2.5">
                          <BookingDemoDialog
                            variant="card"
                            destinationName={dest.name}
                            priceLabel={dest.price_label}
                            availabilityLabel={dest.availability}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {data.suggestions.length > 0 && (
              <section>
                <h2 className="mb-4 font-serif text-xl text-foreground">{t("favorites.sectionSuggestions")}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {data.suggestions.map((s) => {
                    const Icon = iconForLabel(s.type);
                    return (
                      <Link
                        key={s.targetKey}
                        to={`/decouverte?title=${encodeURIComponent(s.title)}`}
                        className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/20"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Icon className="h-4 w-4 text-accent" aria-hidden />
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.type}</span>
                          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" aria-hidden />
                            {s.duration}
                          </div>
                        </div>
                        <h3 className="font-serif text-lg text-foreground">{s.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>
                        <span className="mt-4 text-sm font-medium text-accent">{t("favorites.openDetail")}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
    </PageShell>
  );
};

export default FavoritesPage;
