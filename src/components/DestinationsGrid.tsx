import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowRight, Loader2 } from "lucide-react";
import { destinationImages } from "@/lib/destinationImages";
import { apiUrl } from "@/lib/api";
import { FALLBACK_DESTINATIONS, type DestinationRow } from "@/lib/destinations-data";

const fetchDestinations = async (): Promise<DestinationRow[]> => {
  const r = await fetch(apiUrl("/api/destinations"));
  if (!r.ok) throw new Error("destinations");
  return r.json();
};

const DestinationsGrid = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    retry: 2,
    retryDelay: 800,
  });

  const displayRows = isError ? FALLBACK_DESTINATIONS : (data ?? []);

  return (
    <section className="px-6 py-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12"
      >
        <p className="text-accent text-sm tracking-[0.15em] uppercase font-medium mb-2">
          Destinations tendance
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.1] text-balance">
          Où partir cette saison ?
        </h2>
      </motion.div>

      {isLoading && !isError && (
        <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement des destinations…
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayRows.filter((d) => destinationImages[d.slug]).map((dest, i) => {
            const src = destinationImages[dest.slug];
            const to = `/destination/${encodeURIComponent(dest.slug)}`;
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
                className="h-full"
              >
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
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                        {dest.tag}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 flex translate-y-2 items-center justify-between opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-sm font-medium text-primary-foreground">Voir l'itinéraire</span>
                      <ArrowRight className="h-4 w-4 text-primary-foreground" aria-hidden />
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-foreground">{dest.name}</h3>
                      <p className="text-sm text-muted-foreground">{dest.country}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                      <span className="font-medium tabular-nums text-foreground">
                        {typeof dest.rating === "number" ? dest.rating : Number(dest.rating)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{dest.price}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DestinationsGrid;
