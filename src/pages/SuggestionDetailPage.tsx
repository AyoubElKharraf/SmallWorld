import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FALLBACK_SUGGESTIONS,
  fetchSuggestions,
  resolveDetails,
  iconForLabel,
  type Suggestion,
} from "@/lib/suggestions-data";
import { PageBackLink } from "@/components/layout/PageBackLink";
import { PageShell } from "@/components/layout/PageShell";
import { ActionBar } from "@/components/layout/ActionBar";
import { Button } from "@/components/ui/button";

function mergeSuggestionList(api: Suggestion[] | undefined): Suggestion[] {
  if (api?.length) return api;
  return FALLBACK_SUGGESTIONS;
}

const SuggestionDetailPage = () => {
  const { t } = useTranslation();
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
    <PageShell variant="article" className="min-h-[60vh] pb-16 pt-8">
      <PageBackLink to="/assistant">{t("suggestionDetail.backAssistant")}</PageBackLink>

      {isLoading && <p className="text-sm text-muted-foreground">{t("suggestionDetail.loading")}</p>}

      {!isLoading && !suggestion && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            {titleParam ? t("suggestionDetail.notFound") : t("suggestionDetail.noneSelected")}
          </p>
          <Button asChild variant="default">
            <Link to="/assistant">{t("nav.assistant")}</Link>
          </Button>
        </div>
      )}

      {suggestion && Icon && (
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
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
            <h2 className="mb-4 font-serif text-xl text-foreground">{t("suggestionDetail.summaryTitle")}</h2>
            <div className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {resolveDetails(suggestion)}
            </div>
            <ActionBar className="mt-10">
              <Button asChild className="h-11 px-6">
                <Link to="/carte">{t("destinationDetail.ctaMap")}</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 px-6">
                <Link to="/destinations">{t("nav.destinations")}</Link>
              </Button>
            </ActionBar>
          </div>
        </motion.article>
      )}
    </PageShell>
  );
};

export default SuggestionDetailPage;
