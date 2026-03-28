import { useTranslation } from "react-i18next";
import DestinationsGrid from "@/components/DestinationsGrid";
import DestinationsSearchBar from "@/components/DestinationsSearchBar";
import TrustStrip from "@/components/TrustStrip";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

const DestinationsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh]">
      <PageShell className="pb-6 pt-8 md:pb-8 md:pt-10">
        <PageHeader
          size="hero"
          kicker={t("destinationsPage.pageKicker")}
          title={t("destinationsPage.pageTitle")}
          description={t("destinationsPage.pageDesc")}
        />
      </PageShell>

      <div className="border-b border-border bg-muted/30">
        <PageShell noVerticalPadding className="pb-8 pt-6 md:pb-10 md:pt-8">
          <div className="flex flex-col gap-8">
            <DestinationsSearchBar />
            <TrustStrip />
          </div>
        </PageShell>
      </div>

      <DestinationsGrid />
    </div>
  );
};

export default DestinationsPage;
