import { Link } from "react-router-dom";
import { Plane } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type FooterProps = { variant?: "default" | "compact" };

const Footer = ({ variant = "default" }: FooterProps) => {
  const { t } = useTranslation();
  const compact = variant === "compact";

  if (compact) {
    return (
      <footer
        className={cn(
          "mt-auto border-t border-border/80 bg-primary text-primary-foreground",
          "px-5 py-6 sm:px-6"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Plane className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            <span className="font-serif text-base">{t("brand")}</span>
            <span className="hidden text-primary-foreground/50 sm:inline">·</span>
            <span className="text-xs text-primary-foreground/60">© 2026 {t("footer.rights")}</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-primary-foreground/75">
            <Link to="/destinations" className="transition hover:text-primary-foreground">
              {t("nav.destinations")}
            </Link>
            <Link to="/assistant" className="transition hover:text-primary-foreground">
              {t("nav.assistant")}
            </Link>
            <Link to="/carte" className="transition hover:text-primary-foreground">
              {t("nav.carte")}
            </Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-primary text-primary-foreground px-6 py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-5 h-5" aria-hidden />
            <span className="font-serif text-xl">{t("brand")}</span>
          </div>
          <p className="text-primary-foreground/60 text-sm max-w-xs">{t("footer.tagline")}</p>
        </div>
        <div className="flex gap-16 text-sm">
          <div>
            <h4 className="font-medium mb-3">{t("footer.explore")}</h4>
            <ul className="space-y-2 text-primary-foreground/60">
              <li>
                <Link to="/destinations" className="hover:text-primary-foreground transition-colors">
                  {t("nav.destinations")}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-primary-foreground transition-colors">
                  {t("nav.assistant")}
                </Link>
              </li>
              <li>
                <Link to="/carte" className="hover:text-primary-foreground transition-colors">
                  {t("nav.carte")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">{t("footer.about")}</h4>
            <ul className="space-y-2 text-primary-foreground/60">
              <li>
                <Link to="/login" className="hover:text-primary-foreground transition-colors">
                  {t("nav.login")}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-foreground transition-colors">
                  {t("nav.register")}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-primary-foreground transition-colors">
                  {t("nav.admin")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-primary-foreground/10 text-xs text-primary-foreground/40">
        © 2026 {t("brand")}. {t("footer.rights")}
      </div>
    </footer>
  );
};

export default Footer;
