import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = { className?: string; variant?: "hero" | "solid" };

export const LanguageSwitcher = ({ className, variant = "solid" }: Props) => {
  const { i18n, t } = useTranslation();

  return (
    <Select
      value={i18n.language?.startsWith("en") ? "en" : "fr"}
      onValueChange={(lng) => void i18n.changeLanguage(lng)}
    >
      <SelectTrigger
        aria-label={t("nav.lang")}
        className={cn(
          "h-8 w-[100px] text-xs border-0 bg-transparent shadow-none",
          variant === "hero"
            ? "text-primary-foreground/90 focus:ring-primary-foreground/30"
            : "text-foreground",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">FR</SelectItem>
        <SelectItem value="en">EN</SelectItem>
      </SelectContent>
    </Select>
  );
};
