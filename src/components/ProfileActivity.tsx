import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { destinationImages } from "@/lib/destinationImages";
import { easeSmooth } from "@/lib/motion";

type FavRes = {
  destinations: Array<{
    slug: string;
    name: string;
    country: string;
    targetKey: string;
  }>;
  suggestions: Array<{ title: string; type: string; targetKey: string }>;
};

async function fetchFavorites(): Promise<FavRes> {
  const r = await apiFetch("/api/favorites");
  if (!r.ok) throw new Error("favorites");
  return r.json();
}

export function ProfileActivity() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: fetchFavorites,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/80 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {t("profile.activityLoading")}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        {t("profile.activityError")}
      </p>
    );
  }

  const dests = data?.destinations ?? [];
  const suggs = data?.suggestions ?? [];
  const total = dests.length + suggs.length;
  const previewDest = dests.slice(0, 2);
  const previewSugg = suggs.slice(0, 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: easeSmooth }}
      className="rounded-2xl border border-border/80 bg-gradient-to-b from-accent/[0.06] to-card/80 p-6 shadow-md shadow-foreground/[0.04] ring-1 ring-border/50 backdrop-blur-sm md:p-8"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Heart className="h-4 w-4 fill-accent/30" aria-hidden />
        </div>
        <div>
          <h2 className="font-serif text-lg text-foreground">{t("profile.activityTitle")}</h2>
          <p className="text-xs text-muted-foreground">{t("profile.activitySubtitle")}</p>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">{t("profile.activityEmpty")}</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-foreground">
            {total === 1 ? t("profile.activityOne") : t("profile.activityMany", { count: total })}
          </p>
          <ul className="mb-4 space-y-2">
            {previewDest.map((d, i) => {
              const img = destinationImages[d.slug];
              return (
                <motion.li
                  key={d.targetKey}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: easeSmooth }}
                >
                  <Link
                    to={`/destination/${encodeURIComponent(d.slug)}`}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition hover:border-accent/30 hover:bg-muted/50"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="h-11 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-11 w-14 shrink-0 rounded-lg bg-muted" />
                    )}
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                      {d.name}
                      <span className="block text-xs font-normal text-muted-foreground">{d.country}</span>
                    </span>
                  </Link>
                </motion.li>
              );
            })}
            {previewSugg.map((s, i) => (
              <motion.li
                key={s.targetKey}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (previewDest.length + i) * 0.06, duration: 0.35, ease: easeSmooth }}
              >
                <Link
                  to={`/decouverte?title=${encodeURIComponent(s.title)}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition hover:border-accent/30 hover:bg-muted/50"
                >
                  <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                  </div>
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                    {s.title}
                    <span className="block text-xs font-normal capitalize text-muted-foreground">{s.type}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </>
      )}

      <Link
        to="/favoris"
        className="inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:gap-2.5"
      >
        {t("profile.activityCta")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </motion.section>
  );
}
