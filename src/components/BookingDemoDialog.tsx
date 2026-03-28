import { Link } from "react-router-dom";
import { CalendarCheck, CalendarRange, CreditCard, MailCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type BookingDemoDialogProps = {
  variant?: "hero" | "card";
  /** Nom affiché dans le titre (fiche / carte) */
  destinationName?: string;
  /** Libellé prix (ex. « À partir de 890€ ») */
  priceLabel?: string;
  /** Disponibilité affichée si fournie */
  availabilityLabel?: string;
};

export function BookingDemoDialog({
  variant = "hero",
  destinationName,
  priceLabel,
  availabilityLabel,
}: BookingDemoDialogProps) {
  const { t } = useTranslation();
  const isCard = variant === "card";

  const title = destinationName
    ? t("destinationDetail.bookDialogTitlePlace", { place: destinationName })
    : t("destinationDetail.bookDialogTitle");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="default"
          className={cn(
            isCard
              ? "h-9 shrink-0 rounded-lg border-0 bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
              : "h-auto min-h-10 rounded-xl border-0 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          )}
        >
          <CalendarCheck className={cn("mr-2 shrink-0", isCard ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden />
          {t("destinationDetail.bookCta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(90vh,640px)] max-w-lg overflow-y-auto border-border sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl leading-snug">{title}</DialogTitle>
          <DialogDescription className="text-left text-base leading-relaxed">
            {t("destinationDetail.bookDialogBody")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("destinationDetail.bookSummarySection")}
            </p>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <CalendarRange className="h-4 w-4 shrink-0" aria-hidden />
                  {t("destinationDetail.bookSummaryDates")}
                </dt>
                <dd className="text-right font-medium text-foreground">
                  {t("destinationDetail.bookSummaryDatesPlaceholder")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0" aria-hidden />
                  {t("destinationDetail.bookSummaryTravelers")}
                </dt>
                <dd className="text-right font-medium text-foreground">
                  {t("destinationDetail.bookSummaryTravelersValue")}
                </dd>
              </div>
              {priceLabel ? (
                <div className="flex items-start justify-between gap-3 border-t border-border/60 pt-2.5">
                  <dt className="text-muted-foreground">{t("destinationDetail.bookSummaryPrice")}</dt>
                  <dd className="text-right font-semibold text-foreground">{priceLabel}</dd>
                </div>
              ) : null}
              {availabilityLabel ? (
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">{t("destinationDetail.bookSummaryAvailability")}</dt>
                  <dd className="max-w-[60%] text-right text-foreground">{availabilityLabel}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("destinationDetail.bookStepsTitle")}
            </p>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-3 rounded-lg border border-border/80 bg-background/80 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  1
                </span>
                <span className="pt-0.5 leading-snug text-foreground">{t("destinationDetail.bookStep1")}</span>
              </li>
              <li className="flex gap-3 rounded-lg border border-border/80 bg-background/80 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  2
                </span>
                <span className="flex items-start gap-2 pt-0.5 leading-snug text-foreground">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  {t("destinationDetail.bookStep2")}
                </span>
              </li>
              <li className="flex gap-3 rounded-lg border border-border/80 bg-background/80 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  3
                </span>
                <span className="flex items-start gap-2 pt-0.5 leading-snug text-foreground">
                  <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  {t("destinationDetail.bookStep3")}
                </span>
              </li>
            </ol>
          </div>

          <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {t("destinationDetail.bookDialogNote")}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-2">
          <p className="text-sm font-medium text-foreground">{t("destinationDetail.bookDialogHint")}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <DialogClose asChild>
              <Button asChild className="w-full sm:w-auto" variant="default">
                <Link to="/assistant">{t("destinationDetail.bookDialogAssistant")}</Link>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button asChild className="w-full sm:w-auto" variant="outline">
                <Link to="/carte">{t("destinationDetail.bookDialogMap")}</Link>
              </Button>
            </DialogClose>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="text-muted-foreground">
              {t("destinationDetail.bookDialogClose")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
