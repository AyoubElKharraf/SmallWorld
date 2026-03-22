import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Clock, ArrowRight, Loader2 } from "lucide-react";
import {
  FALLBACK_SUGGESTIONS,
  fetchSuggestions,
  filterSuggestionsLocal,
  iconForLabel,
  type Suggestion,
} from "@/lib/suggestions-data";

type SuggestionCardProps = {
  suggestion: Suggestion;
  index: number;
};

function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const Icon = iconForLabel(suggestion.type);
  const to = `/decouverte?title=${encodeURIComponent(suggestion.title)}`;

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
      className="h-full"
    >
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
            Voir le détail
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

const AISuggestions = () => {
  const [input, setInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["suggestions", activeQuery],
    queryFn: () => fetchSuggestions(activeQuery),
    retry: 2,
    retryDelay: 800,
  });

  const suggestions = isError
    ? filterSuggestionsLocal(FALLBACK_SUGGESTIONS, activeQuery)
    : (data?.suggestions ?? []);
  const showResults = true;

  return (
    <section className="px-6 py-28 bg-primary/[0.04]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-12"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="text-accent text-sm tracking-[0.15em] uppercase font-medium">
              Assistant IA
            </p>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.1] text-balance mb-4">
            Votre guide de voyage intelligent
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            Décrivez votre voyage idéal et notre IA vous suggère itinéraires, restaurants et activités sur mesure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl shadow-lg shadow-foreground/[0.04] border border-border p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Exemple : « Je veux visiter le Portugal en famille pendant 5 jours, avec des plages et de la bonne cuisine. »
              </p>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Décrivez votre voyage idéal..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 min-w-[200px] bg-secondary/50 text-foreground rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => setActiveQuery(input.trim())}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Suggérer
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {showResults && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {isLoading && !data && (
              <div className="col-span-full flex justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement des suggestions…
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
        )}
      </div>
    </section>
  );
};

export default AISuggestions;
