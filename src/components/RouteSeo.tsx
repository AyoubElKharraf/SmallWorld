import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ?? "";

export const RouteSeo = () => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";

  const meta = (() => {
    if (pathname.startsWith("/destination/")) {
      return null;
    }
    switch (pathname) {
      case "/":
        return { title: t("seo.homeTitle"), desc: t("seo.homeDesc") };
      case "/destinations":
        return { title: t("seo.destinationsTitle"), desc: t("seo.destinationsDesc") };
      case "/assistant":
        return { title: t("seo.assistantTitle"), desc: t("seo.assistantDesc") };
      case "/carte":
        return { title: t("seo.carteTitle"), desc: t("seo.carteDesc") };
      case "/decouverte":
        return { title: t("seo.discoveryTitle"), desc: t("seo.discoveryDesc") };
      case "/login":
        return { title: t("seo.loginTitle"), desc: t("seo.homeDesc") };
      case "/register":
        return { title: t("seo.registerTitle"), desc: t("seo.homeDesc") };
      case "/admin":
        return { title: t("seo.adminTitle"), desc: t("seo.homeDesc") };
      case "/profil":
        return { title: t("seo.profileTitle"), desc: t("seo.profileDesc") };
      case "/favoris":
        return { title: t("seo.favoritesTitle"), desc: t("seo.favoritesDesc") };
      default:
        return { title: t("seo.notFoundTitle"), desc: t("seo.homeDesc") };
    }
  })();

  const ogImage = siteUrl ? `${siteUrl}/favicon.png` : "/favicon.png";

  return (
    <Helmet htmlAttributes={{ lang }} prioritizeSeoTags>
      {meta ? (
        <>
          <title>{meta.title}</title>
          <meta name="description" content={meta.desc} />
          <meta property="og:title" content={meta.title} />
          <meta property="og:description" content={meta.desc} />
          <meta property="og:type" content="website" />
          {siteUrl ? <meta property="og:url" content={`${siteUrl}${pathname}`} /> : null}
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={meta.title} />
          <meta name="twitter:description" content={meta.desc} />
        </>
      ) : null}
    </Helmet>
  );
};
