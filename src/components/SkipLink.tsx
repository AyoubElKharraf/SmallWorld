import { useTranslation } from "react-i18next";

export const SkipLink = () => {
  const { t } = useTranslation();
  return (
    <a href="#main-content" className="skip-link">
      {t("skip")}
    </a>
  );
};
