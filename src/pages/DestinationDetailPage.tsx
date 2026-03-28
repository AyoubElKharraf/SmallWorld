import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useParams } from "react-router-dom";
import { MapPin, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { apiUrl } from "@/lib/api";
import {
  FALLBACK_DESTINATIONS,
  itineraryForSlug,
  type DestinationRow,
} from "@/lib/destinations-data";
import { destinationImages } from "@/lib/destinationImages";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBackLink } from "@/components/layout/PageBackLink";
import { PageShell } from "@/components/layout/PageShell";

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ?? "";

function absoluteOgImage(asset: string | undefined): string {
  const fallback = siteUrl ? `${siteUrl}/favicon.png` : "/favicon.png";
  if (!asset) return fallback;
  if (asset.startsWith("http")) return asset;
  const path = asset.startsWith("/") ? asset : `/${asset}`;
  return siteUrl ? `${siteUrl}${path}` : path;
}

const fetchDestinations = async (): Promise<DestinationRow[]> => {
  const r = await fetch(apiUrl("/api/destinations"));
  if (!r.ok) throw new Error("destinations");
  return r.json();
};

function mergeList(api: DestinationRow[] | undefined): DestinationRow[] {
  if (api?.length) return api;
  return FALLBACK_DESTINATIONS;
}

const DestinationDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    retry: 1,
  });

  const list = mergeList(data);
  const dest = list.find((d) => d.slug === slug);
  const img = destinationImages[slug];
  const rating =
    dest && typeof dest.rating === "number" ? dest.rating : Number(dest?.rating ?? 0);
  const locale = i18n.language?.startsWith("en") ? "en-US" : "fr-FR";
  const reviewFormatted =
    dest?.review_count != null && dest.review_count > 0
      ? dest.review_count.toLocaleString(locale)
      : null;

  const fullPageUrl = siteUrl ? `${siteUrl}${pathname}` : undefined;
  const ogLocale = i18n.language?.startsWith("en") ? "en_US" : "fr_FR";

  const seo = useMemo(() => {
    if (isLoading) {
      return {
        title: t("seo.destinationDetailTitle"),
        desc: t("seo.destinationDetailDesc"),
        ogType: "website" as const,
        ogImage: absoluteOgImage(undefined),
        imageAlt: t("seo.destinationDetailTitle"),
      };
    }
    if (!dest) {
      return {
        title: t("seo.destinationSlugNotFoundTitle"),
        desc: t("seo.destinationSlugNotFoundDesc"),
        ogType: "website" as const,
        ogImage: absoluteOgImage(undefined),
        imageAlt: t("seo.destinationSlugNotFoundTitle"),
      };
    }
    return {
      title: t("seo.destinationPageTitle", { name: dest.name, country: dest.country }),
      desc: t("seo.destinationPageDesc", { name: dest.name, country: dest.country, price: dest.price }),
      ogType: "article" as const,
      ogImage: absoluteOgImage(img),
      imageAlt: `${dest.name}, ${dest.country}`,
    };
  }, [isLoading, dest, img, t]);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{seo.title}</title>
        <meta name="description" content={seo.desc} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.desc} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:locale" content={ogLocale} />
        {fullPageUrl ? <meta property="og:url" content={fullPageUrl} /> : null}
        {fullPageUrl ? <link rel="canonical" href={fullPageUrl} /> : null}
        <meta property="og:image" content={seo.ogImage} />
        <meta property="og:image:alt" content={seo.imageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.desc} />
        <meta name="twitter:image" content={seo.ogImage} />
      </Helmet>
      <PageShell variant="article" className="min-h-[60vh] pb-16 pt-8">
        <PageBackLink to="/destinations">{t("nav.destinations")}</PageBackLink>

        {isLoading && (
          <div className="space-y-6" aria-busy="true" aria-label={t("destinationsGrid.loading")}>
            <Skeleton className="aspect-[21/9] max-h-72 w-full rounded-2xl" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="h-9 w-4/5 max-w-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {!isLoading && !dest && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="mb-4 text-muted-foreground">{t("destinationDetail.notFound")}</p>
            <Link to="/" className="font-medium text-accent underline-offset-4 hover:underline">
              {t("destinationDetail.backHome")}
            </Link>
          </div>
        )}

        {!isLoading && dest && (
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {img && (
              <div className="relative aspect-[21/9] max-h-72 w-full overflow-hidden">
                <img src={img} alt={`${dest.name}, ${dest.country}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                        {dest.tag}
                      </span>
                      {dest.deal_badge && (
                        <span className="rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {dest.deal_badge}
                        </span>
                      )}
                      {dest.availability && <AvailabilityBadge label={dest.availability} />}
                    </div>
                    <h1 className="font-serif text-3xl text-balance text-foreground md:text-4xl">{dest.name}</h1>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                      {dest.country}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 rounded-xl bg-card/90 px-3 py-2 text-right backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
                      <span className="font-medium tabular-nums text-foreground">{rating}</span>
                      {reviewFormatted && (
                        <span className="text-xs text-muted-foreground">
                          ({reviewFormatted} {t("destinationDetail.reviewsWord")})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-baseline justify-end gap-2">
                      {dest.price_was_label && (
                        <span className="text-sm text-muted-foreground line-through">{dest.price_was_label}</span>
                      )}
                      <span className="text-sm font-semibold text-foreground">{dest.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-8 md:px-10 md:py-10">
              {!img && (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {dest.tag}
                    </span>
                    {dest.deal_badge && (
                      <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-white">
                        {dest.deal_badge}
                      </span>
                    )}
                    {dest.availability && <AvailabilityBadge label={dest.availability} />}
                  </div>
                  <h1 className="font-serif text-3xl text-foreground md:text-4xl">{dest.name}</h1>
                  <p className="mt-2 text-muted-foreground">{dest.country}</p>
                  <div className="mt-4 flex flex-wrap items-baseline gap-2">
                    {dest.price_was_label && (
                      <span className="text-sm text-muted-foreground line-through">{dest.price_was_label}</span>
                    )}
                    <p className="text-sm font-semibold text-foreground">{dest.price}</p>
                  </div>
                </>
              )}

              {typeof dest.viewers_recent === "number" && dest.viewers_recent > 0 && (
                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t("destinationDetail.viewersRecent", { count: dest.viewers_recent })}
                </p>
              )}

              {reviewFormatted && (
                <div className="mt-6 rounded-xl border border-border bg-muted/25 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {t("destinationDetail.reviewsHeadline", {
                      rating,
                      formatted: reviewFormatted,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("destinationDetail.reviewsDemo")}</p>
                </div>
              )}

              <h2 className="mb-4 mt-8 font-serif text-xl text-foreground">{t("destinationDetail.itineraryTitle")}</h2>
              <div className="whitespace-pre-line text-pretty text-base leading-relaxed text-muted-foreground">
                {itineraryForSlug(slug, dest.name)}
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/carte"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
                >
                  {t("destinationDetail.ctaMap")}
                </Link>
                <Link
                  to="/assistant"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
                >
                  {t("destinationDetail.ctaAssistant")}
                </Link>
              </div>

              <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">{t("destinationDetail.demoDisclaimer")}</p>
            </div>
          </motion.article>
        )}
    </PageShell>
    </>
  );
};

export default DestinationDetailPage;
