import { useTranslation } from "react-i18next";
import AISuggestions from "@/components/AISuggestions";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

const AssistantPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh]">
      <PageShell className="pb-6 pt-8 md:pb-8 md:pt-10">
        <PageHeader
          size="hero"
          kicker={t("assistant.pageKicker")}
          title={t("assistant.pageTitle")}
          description={t("assistant.pageDesc")}
        />
      </PageShell>
      <AISuggestions />
    </div>
  );
};

export default AssistantPage;
