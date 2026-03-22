import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Map, Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
};

const HomeFeatures = () => {
  const { t } = useTranslation();

  const cards = [
    {
      to: "/destinations",
      icon: Compass,
      title: "home.featDestTitle",
      desc: "home.featDestDesc",
    },
    {
      to: "/assistant",
      icon: Sparkles,
      title: "home.featAssistantTitle",
      desc: "home.featAssistantDesc",
    },
    {
      to: "/carte",
      icon: Map,
      title: "home.featMapTitle",
      desc: "home.featMapDesc",
    },
  ] as const;

  return (
    <section
      id="home-features"
      className="relative scroll-mt-20 border-t border-border/80 bg-gradient-to-b from-muted/40 via-background to-background"
      aria-labelledby="home-features-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 id="home-features-heading" className="font-serif text-3xl md:text-4xl text-foreground text-balance">
            {t("home.featuresTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty leading-relaxed">
            {t("home.featuresSubtitle")}
          </p>
        </motion.div>

        <ul className="grid gap-6 md:grid-cols-3 md:gap-8">
          {cards.map(({ to, icon: Icon, title, desc }, i) => (
            <motion.li
              key={to}
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={to}
                className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition group-hover:bg-primary/15">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-serif text-xl text-foreground">{t(title)}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">{t(desc)}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {t("home.cta")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomeFeatures;
