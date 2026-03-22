import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { apiUrl } from "@/lib/api";
import {
  FALLBACK_DESTINATIONS,
  itineraryForSlug,
  type DestinationRow,
} from "@/lib/destinations-data";
import { destinationImages } from "@/lib/destinationImages";

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

  return (
    <div className="min-h-[60vh] px-6 pb-16 pt-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/destinations"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Destinations
        </Link>

        {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}

        {!isLoading && !dest && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="mb-4 text-muted-foreground">Destination introuvable.</p>
            <Link to="/" className="font-medium text-accent underline-offset-4 hover:underline">
              Retour à l’accueil
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
                    <span className="mb-1 inline-block rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                      {dest.tag}
                    </span>
                    <h1 className="font-serif text-3xl text-balance text-foreground md:text-4xl">{dest.name}</h1>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                      {dest.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-card/90 px-3 py-2 backdrop-blur-sm">
                    <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
                    <span className="font-medium tabular-nums text-foreground">{rating}</span>
                    <span className="text-sm text-muted-foreground">{dest.price}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-8 md:px-10 md:py-10">
              {!img && (
                <>
                  <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {dest.tag}
                  </span>
                  <h1 className="font-serif text-3xl text-foreground md:text-4xl">{dest.name}</h1>
                  <p className="mt-2 text-muted-foreground">{dest.country}</p>
                  <p className="mt-4 text-sm text-muted-foreground">{dest.price}</p>
                </>
              )}

              <h2 className="mb-4 mt-2 font-serif text-xl text-foreground">Itinéraire suggéré</h2>
              <div className="whitespace-pre-line text-pretty text-base leading-relaxed text-muted-foreground">
                {itineraryForSlug(slug, dest.name)}
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/carte"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
                >
                  Voir sur la carte
                </Link>
                <Link
                  to="/assistant"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
                >
                  Assistant IA
                </Link>
              </div>
            </div>
          </motion.article>
        )}
      </div>
    </div>
  );
};

export default DestinationDetailPage;
