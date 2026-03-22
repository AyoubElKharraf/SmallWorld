import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Users, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import heroImg from "@/assets/hero-travel.jpg";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <section className="relative min-h-[max(100svh,600px)] overflow-hidden" aria-labelledby="hero-heading">
      <img
        src={heroImg}
        alt={t("home.heroImageAlt")}
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
      />
      {/* Lisibilité : dégradés + vignette */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/25 to-foreground/70"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_35%,transparent_20%,rgba(0,0,0,0.45)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[max(100svh,600px)] flex-col items-center justify-center px-5 pb-28 pt-28 text-center sm:px-6 md:pb-36 md:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/85"
        >
          {t("home.heroKicker")}
        </motion.p>

        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-4xl font-serif text-4xl leading-[1.05] text-balance text-primary-foreground sm:text-5xl md:text-7xl lg:text-8xl"
        >
          {t("home.heroTitle")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 max-w-xl text-pretty text-lg text-primary-foreground/75 md:text-xl"
        >
          {t("home.heroSubtitle")}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="w-full max-w-2xl"
        >
          <div className="flex min-w-0 items-center gap-2 rounded-3xl border border-white/20 bg-card/90 p-2 shadow-2xl shadow-black/20 backdrop-blur-md ring-1 ring-white/10">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:px-4">
              <MapPin className="h-5 w-5 shrink-0 text-accent" aria-hidden />
              <input
                type="search"
                name="q"
                placeholder={t("home.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                className="w-full min-w-0 bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                aria-label={t("home.searchPlaceholder")}
              />
            </div>
            <button
              type="submit"
              aria-label={t("home.searchButton")}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl bg-primary px-3 py-3 font-medium text-primary-foreground transition hover:opacity-95 active:scale-[0.98] sm:px-6"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-sm sm:text-base">{t("home.searchButton")}</span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-primary-foreground/65">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
              {t("home.metaFlexible")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-sm">
              <Users className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
              {t("home.metaTravelers")}
            </span>
          </div>

          <nav
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            aria-label={t("home.quickNav")}
          >
            {(
              [
                ["/destinations", t("nav.destinations")],
                ["/assistant", t("nav.assistant")],
                ["/carte", t("nav.carte")],
              ] as const
            ).map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-xs font-medium text-primary-foreground/90 backdrop-blur-sm transition hover:bg-primary-foreground/20 sm:text-sm"
              >
                {label}
              </Link>
            ))}
          </nav>
        </motion.form>

        <a
          href="#home-features"
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-primary-foreground/80 transition hover:text-primary-foreground"
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]">
            {t("home.scrollHint")}
          </span>
          <ChevronDown className="h-6 w-6 motion-safe:animate-bounce" aria-hidden />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
