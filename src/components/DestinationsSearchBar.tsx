import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { MapPin, Search, CalendarRange } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DestinationsSearchBar = () => {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const qParam = params.get("q") ?? "";
  const [localQ, setLocalQ] = useState(qParam);
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState("2");

  useEffect(() => {
    setLocalQ(qParam);
  }, [qParam]);

  const locale = i18n.language?.startsWith("en") ? enUS : fr;

  const dateLabel =
    range?.from && range?.to
      ? `${format(range.from, "d MMM", { locale })} – ${format(range.to, "d MMM yyyy", { locale })}`
      : t("destinationsSearch.datesFlexible");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    const trimmed = localQ.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    setParams(next);
  };

  return (
    <form onSubmit={onSubmit} className="w-full" aria-label={t("destinationsSearch.formAria")}>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm",
          "lg:flex-row lg:items-stretch"
        )}
      >
        <div className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-border/80 bg-background px-3">
          <MapPin className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <input
            type="search"
            name="q"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder={t("destinationsSearch.placeholder")}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label={t("destinationsSearch.placeholder")}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-12 shrink-0 justify-start gap-2 lg:min-w-[200px]"
            >
              <CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate text-left text-sm">{dateLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setRange(undefined)}
              >
                {t("destinationsSearch.clearDates")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger className="h-12 w-full shrink-0 lg:w-[160px]">
            <SelectValue placeholder={t("destinationsSearch.guests")} />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {t("destinationsSearch.guestsCount", { count: n })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="h-12 shrink-0 gap-2 px-6">
          <Search className="h-4 w-4" aria-hidden />
          {t("destinationsSearch.submit")}
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted-foreground">{t("destinationsSearch.hint")}</p>
        {qParam && (
          <button
            type="button"
            className="text-xs font-medium text-accent underline-offset-4 hover:underline"
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("q");
              setParams(next);
              setLocalQ("");
            }}
          >
            {t("destinationsSearch.clearQuery")}
          </button>
        )}
      </div>
    </form>
  );
};

export default DestinationsSearchBar;
