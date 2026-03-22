import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";
import {
  FALLBACK_SUGGESTIONS,
  fetchSuggestions,
  resolveDetails,
  iconForLabel,
  type Suggestion,
} from "@/lib/suggestions-data";

function mergeSuggestionList(api: Suggestion[] | undefined): Suggestion[] {
  if (api?.length) return api;
  return FALLBACK_SUGGESTIONS;
}

const SuggestionDetailPage = () => {
  const [searchParams] = useSearchParams();
  const titleParam = searchParams.get("title")?.trim() ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["suggestions", ""],
    queryFn: () => fetchSuggestions(""),
    retry: 1,
  });

  const list = mergeSuggestionList(data?.suggestions);
  const suggestion = titleParam ? list.find((s) => s.title === titleParam) : undefined;

  const Icon = suggestion ? iconForLabel(suggestion.type) : undefined;

  return (
    <div className="min-h-[60vh] px-6 pb-16 pt-8">
      <div className="mx-auto max-w-3xl">
          <Link
            to="/assistant"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour à l’assistant
          </Link>

          {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}

          {!isLoading && !suggestion && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                {titleParam
                  ? "Cette suggestion n’a pas été trouvée."
                  : "Aucune suggestion sélectionnée."}
              </p>
              <Link to="/assistant" className="font-medium text-accent underline-offset-4 hover:underline">
                Voir l’assistant IA
              </Link>
            </div>
          )}

          {suggestion && Icon && (
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border/80 bg-muted/20 px-6 py-8 md:px-10">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <Icon className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {suggestion.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" aria-hidden />
                    {suggestion.duration}
                  </div>
                </div>
                <h1 className="font-serif text-3xl text-balance text-foreground md:text-4xl">{suggestion.title}</h1>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{suggestion.description}</p>
              </div>
              <div className="px-6 py-8 md:px-10 md:py-10">
                <h2 className="mb-4 font-serif text-xl text-foreground">À retenir</h2>
                <div className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {resolveDetails(suggestion)}
                </div>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    to="/carte"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
                  >
                    Voir la carte
                  </Link>
                  <Link
                    to="/destinations"
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
                  >
                    Destinations
                  </Link>
                </div>
              </div>
            </motion.article>
          )}
        </div>
    </div>
  );
};

export default SuggestionDetailPage;
