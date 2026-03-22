# Évaluation générale — Voyageur / SmallWorld

## Positionnement produit

**Voyageur** (projet SmallWorld) est une application web de planification de voyage combinant une vitrine de destinations, un assistant conversationnel, une carte interactive et un espace administration. L’expérience vise un public voyageur (découverte, inspiration, itinéraires) avec un positionnement clair côté **Voyageur** (marque utilisateur) et **SmallWorld** comme nom de code / dépôt technique.

### Points forts

- Parcours principal lisible : accueil, destinations, assistant, carte.
- Authentification et rôles (client / admin) pour séparer usage grand public et pilotage.
- Tableau de bord admin : statistiques, historique des recherches, notifications push in-app, export CSV.

### Axes d’évolution (hors périmètre immédiat)

- Tests automatisés e2e sur les flux critiques (connexion, recherche, admin).
- Métriques produit (événements analytics) pour mesurer l’engagement par page.

---

## Sécurité — mesures mises en œuvre

### Côté API (Node / Express)

- **Helmet** (en production) : en-têtes HTTP de durcissement ; la CSP complète est désactivée au profit d’une configuration front (assets, cartes) — à resserrer si le front est servi sous le même domaine avec des règles explicites.
- **Rate limiting** : limite globale sur `/api` et limite renforcée sur `/api/auth/*` pour limiter le bruteforce et l’abus (variables `RATE_LIMIT_API_MAX`, `RATE_LIMIT_AUTH_MAX`).
- **Taille des corps JSON** limitée (ex. 512 ko) pour réduire le risque de déni de service par payloads volumineux.
- **Trust proxy** : correct si l’API est derrière un reverse proxy (pour IP et rate limit).
- **JWT** : secret configurable (`JWT_SECRET`) — à utiliser long, aléatoire et unique en production.
- **CORS** : `CORS_ORIGIN` pour restreindre les origines en production.
- **Santé** : `/api/health` pour le monitoring (uptime, version, mémoire, état MySQL).

### Côté client

- **Jeton** stocké côté client et envoyé en `Authorization: Bearer` sur les appels API (à préférer à des cookies httpOnly si vous migrez vers des cookies, avec protection CSRF adaptée).
- **PWA / Service Worker** : les requêtes vers `/api` sont exclues du fallback réseau du navigateur pour éviter des comportements incorrects sur les appels dynamiques.

### Bonnes pratiques opérationnelles

- Ne jamais committer `.env` ; partir de `server/.env.example` et `.env.example` (front).
- En production : HTTPS, secrets rotatifs, sauvegardes MySQL, journalisation centralisée.

---

## SEO et accessibilité (résumé)

- Métadonnées par route via **react-helmet-async** ; `VITE_SITE_URL` pour des URLs Open Graph absolues.
- Fichiers statiques `public/robots.txt` et `public/sitemap.xml` (à adapter au domaine réel).
- Lien d’évitement « Aller au contenu », landmarks et libellés `aria-*` sur la navigation et les notifications.
- Internationalisation **FR / EN** (i18next) pour navigation, pied de page, SEO, admin et carte.

---

## CI

Le dépôt inclut un workflow GitHub Actions (`.github/workflows/ci.yml`) qui installe les dépendances, exécute le linter et construit le front pour valider les changements à chaque push ou PR sur la branche principale.
