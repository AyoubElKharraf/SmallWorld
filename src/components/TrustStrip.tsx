import { ShieldCheck, Lock, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = { className?: string };

/**
 * Bandeau confiance type OTA — trois champs distincts (paiement, annulation, avis) — /destinations.
 */
const TrustStrip = ({ className }: Props) => {
  const { t } = useTranslation();
  const items = [
    { icon: ShieldCheck, key: "secure" as const },
    { icon: Lock, key: "cancel" as const },
    { icon: Star, key: "reviews" as const },
  ];

  const fieldClass =
    "flex min-w-0 items-start gap-3 rounded-xl border border-border/80 bg-card/95 p-4 shadow-sm sm:p-5";

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4 lg:gap-5">
        {items.map(({ icon: Icon, key }) => (
          <div key={key} className={fieldClass}>
            <Icon
              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              strokeWidth={2}
              aria-hidden
            />
            <p className="min-w-0 text-sm leading-snug text-muted-foreground">
              <span className="font-semibold text-foreground">{t(`trustStrip.${key}Title`)}</span>
              <span> — {t(`trustStrip.${key}Desc`)}</span>
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-border/40 pt-4 text-left text-xs leading-relaxed text-muted-foreground/95 md:mt-5 md:max-w-2xl md:border-t-0 md:pt-0">
        {t("trustStrip.disclaimer")}
      </p>
    </div>
  );
};

export default TrustStrip;
