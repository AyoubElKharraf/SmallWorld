import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  FALLBACK_SUGGESTIONS,
  fetchSuggestions,
  filterSuggestionsLocal,
  iconForLabel,
  type Suggestion,
} from "@/lib/suggestions-data";
import { ErrorStatePanel } from "@/components/ErrorStatePanel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageShell } from "@/components/layout/PageShell";
import { ActionBar } from "@/components/layout/ActionBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SuggestionCardProps = {
  suggestion: Suggestion;
  index: number;
};

function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const { t } = useTranslation();
  const Icon = iconForLabel(suggestion.type);
  const to = `/decouverte?title=${encodeURIComponent(suggestion.title)}`;
  const favKey = suggestion.id != null ? `sugg:${suggestion.id}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: 0.15 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative h-full"
    >
      {favKey ? <FavoriteButton targetKey={favKey} className="absolute right-3 top-3 z-20" /> : null}
      <Link
        to={to}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-foreground/[0.06]"
      >
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {suggestion.type}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden />
              {suggestion.duration}
            </div>
          </div>
          <h3 className="mb-1.5 font-serif text-xl text-foreground">{suggestion.title}</h3>
          <p className="line-clamp-4 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
            {suggestion.description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            {t("favorites.openDetail")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

const AISuggestions = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["suggestions", activeQuery],
    queryFn: () => fetchSuggestions(activeQuery),
    retry: 2,
    retryDelay: 800,
  });

  const suggestions = isError
    ? filterSuggestionsLocal(FALLBACK_SUGGESTIONS, activeQuery)
    : (data?.suggestions ?? []);

  return (
    <section className="border-t border-border/60 bg-primary/[0.04] py-16 md:py-20">
      <PageShell noVerticalPadding>
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-md shadow-foreground/[0.04] ring-1 ring-border/50 md:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm text-muted-foreground">{t("assistant.exampleHint")}</p>
              <ActionBar className="w-full max-w-3xl">
                <Input
                  type="text"
                  placeholder={t("assistant.searchPlaceholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setActiveQuery(input.trim());
                    }
                  }}
                  className="h-11 min-w-0 flex-1 bg-secondary/40"
                />
                <Button
                  type="button"
                  disabled={isFetching}
                  className="h-11 shrink-0 px-6"
                  onClick={() => setActiveQuery(input.trim())}
                >
                  {isFetching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {isFetching ? t("assistant.suggesting") : t("assistant.suggest")}
                </Button>
              </ActionBar>
            </div>
          </div>
        </motion.div>

        {isError && (
          <div className="mb-6">
            <ErrorStatePanel
              variant="inline"
              title={t("assistant.apiErrorTitle")}
              description={t("assistant.apiErrorDesc")}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {isLoading && !data && (
            <div className="col-span-full flex justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              {t("assistant.loadingSuggestions")}
            </div>
          )}
          {suggestions.map((suggestion, i) => (
            <SuggestionCard
              key={`${activeQuery}|${suggestion.type}|${suggestion.title}|${suggestion.duration}|${i}`}
              suggestion={suggestion}
              index={i}
            />
          ))}
        </div>
      </PageShell>
    </section>
  );
};

export default AISuggestions;
