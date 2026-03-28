import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <PageShell variant="lg" className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <PageHeader
          align="center"
          kicker={t("notFound.title")}
          title="404"
          description={t("notFound.description")}
        />
        <Button asChild size="lg" className="mt-6">
          <Link to="/">{t("notFound.cta")}</Link>
        </Button>
      </PageShell>
    </div>
  );
};

export default NotFound;
