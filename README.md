# SmallWorld (Voyageur)

**Plateforme web full-stack** de planification de voyage : catalogue de destinations façon **OTA (démo)**, **assistant IA** pour suggestions d’itinéraires et de lieux, **cartes Leaflet** (carte monde + carte des résultats filtrés), **authentification** JWT (clients / administrateurs), **profil**, **favoris**, **notifications** et **dashboard admin**.

> **Démonstration** : tarifs, disponibilités, avis et affluence sont **fictifs ou simplifiés** ; **aucune réservation réelle** n’est effectuée.

| | |
|---|---|
| **Dépôt** | [github.com/AyoubElKharraf/SmallWorld](https://github.com/AyoubElKharraf/SmallWorld) |
| **Contenu** | Frontend **React + Vite + TypeScript** · API **Express** · schéma **MySQL** |

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Scripts npm](#scripts-npm)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Démarrage en local](#démarrage-en-local)
- [Docker](#docker)
- [Production](#production)
- [Variables d’environnement](#variables-denvironnement)
- [SEO & fichiers statiques](#seo--fichiers-statiques)
- [CI / GitHub Actions](#ci--github-actions)
- [API (référence)](#api-référence)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Fonctionnalités

| Zone | Description |
|------|-------------|
| **Accueil** | Hero, recherche (préférences mémorisées côté client), liens rapides |
| **Destinations** | Barre de recherche ; **bandeau confiance** ; **sidebar filtres** (tri, budget, thématique) en `lg+` ; **vue grille** ou **liste** via `?view=list` ; **carte** des destinations encore affichées après filtres (prix au survol, popup avec lien fiche) |
| **Fiche destination** | Prix indicatifs, avis, disponibilité, itinéraire suggéré ; **SEO dynamique** (titre, description, Open Graph, canonical si `VITE_SITE_URL`) — **FR / EN** |
| **Assistant IA** | Suggestions (API ; repli sur données locales si l’API est indisponible) |
| **Carte** | Marqueurs avec **clustering** ; données API ou jeu de secours |
| **Compte** | Inscription / connexion JWT, profil, **favoris** (destinations + suggestions) |
| **Admin** | Statistiques, utilisateurs, historique des recherches, envoi de notifications |

**Internationalisation** : interface **français** / **anglais** (détection navigateur).

---

## Scripts npm

| Commande | Rôle |
|----------|------|
| `npm run dev` | Vite (frontend), port **8080** par défaut |
| `npm run dev:full` | Vite + API Express en parallèle |
| `npm run build` | Build production → `dist/` |
| `npm run preview` | Prévisualisation du build |
| `npm run check` | `eslint` + `vite build` + `vitest run` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (CI) |
| `npm run docker:up` / `docker:down` | Compose (voir `docker-compose.yml`) |

Dans `server/` : `npm run dev`, `npm start`, `npm run seed:admin`.

---

## Stack technique

### Frontend

| Catégorie | Outils |
|-----------|--------|
| Langage | [TypeScript](https://www.typescriptlang.org/) |
| UI | [React 18](https://react.dev/), [React Router 6](https://reactrouter.com/) |
| Build | [Vite 5](https://vitejs.dev/), [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) |
| Styles | [Tailwind CSS](https://tailwindcss.com/), [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| Composants | [shadcn/ui](https://ui.shadcn.com/) ([Radix UI](https://www.radix-ui.com/)), [CVA](https://cva.style/), [Lucide](https://lucide.dev/) |
| Données | [TanStack Query](https://tanstack.com/query) |
| Formulaires | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Carte | [Leaflet](https://leafletjs.com/), [react-leaflet](https://react-leaflet.js.org/), [leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) |
| i18n | [i18next](https://www.i18next.com/), [react-i18next](https://react.i18next.com/) |
| SEO | [react-helmet-async](https://github.com/staylor/react-helmet-async) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) |
| Qualité | [ESLint 9](https://eslint.org/) (flat config), [Vitest](https://vitest.dev/) |

### Backend (API)

| Catégorie | Outils |
|-----------|--------|
| Runtime | [Node.js](https://nodejs.org/) **20+** (aligné CI / Dockerfile) |
| Framework | [Express 4](https://expressjs.com/) |
| Base | [MySQL](https://www.mysql.com/) 8.x (`utf8mb4`), [mysql2](https://github.com/sidorares/node-mysql2) |
| Auth | [JWT](https://jwt.io/) ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| HTTP | [helmet](https://helmetjs.github.io/) (prod), [cors](https://github.com/expressjs/cors), [express-rate-limit](https://github.com/expressjs/express-rate-limit) |
| Logs | [morgan](https://github.com/expressjs/morgan) |
| Config | [dotenv](https://github.com/motdotla/dotenv) (`server/.env`) |

### DevOps

| Outil | Usage |
|-------|--------|
| [Docker](https://docs.docker.com/) | Image multi-étages : build Vite + Node + fichiers statiques |
| [Docker Compose](https://docs.docker.com/compose/) | MySQL + application |
| [GitHub Actions](https://github.com/features/actions) | CI sur `main` / `master` : `npm ci` puis `npm run check` |

---

## Architecture

- **SPA** React ; en développement, le **proxy Vite** (`vite.config.ts`) proxifie `/api` vers `http://127.0.0.1:3001`.
- **API** Express sous `/api`. Si `SERVE_STATIC_DIR` pointe vers le dossier `dist/` du build Vite, **une seule origine** sert le SPA et l’API.
- **Schéma** : `server/db/init.sql` ; évolutions dans `server/db/migration_*.sql` (favoris / notifications, disponibilité, champs type OTA sur `destinations`, etc.).

---

## Prérequis

- **Node.js** 18+ (recommandé : **20 LTS**)
- **npm**
- **MySQL** 8.x (machine locale ou conteneur)
- **Docker** + **Compose v2** (optionnel, pour le mode conteneurisé)

---

## Démarrage en local

### 1. Base MySQL

```bash
mysql -u root -p < server/db/init.sql
```

Sous **Windows** (PowerShell), utilisez le chemin complet vers `mysql` si besoin.

Bases **déjà existantes** : appliquer les migrations dans l’ordre indiqué dans les commentaires des fichiers, notamment :

| Fichier | Rôle |
|---------|------|
| `server/db/migration_auth.sql` | Si la base prédate les tables utilisateurs (voir le fichier) |
| `server/db/migration_20260328_favorites_notifications.sql` | Favoris + `action_url` sur les notifications |
| `server/db/migration_20260328_destinations_availability.sql` | Colonne `availability` |
| `server/db/migration_20260328_booking_style_destinations.sql` | Champs type OTA (notes, prix, badges, affluence, etc.) |

### 2. API

```bash
cd server
cp .env.example .env
```

Sur Windows : `copy .env.example .env`

Renseigner `DB_USER`, `DB_PASSWORD`, `DB_NAME` (ex. `smallworld`), `PORT` (défaut **3001**), **`JWT_SECRET`**.

Créer un administrateur :

```bash
npm install
npm run seed:admin
```

Compte type : `admin@voyageur.local` / mot de passe défini par `SEED_ADMIN_PASSWORD` (défaut documenté dans `server/.env.example`).

```bash
npm run dev
```

Contrôle : [http://localhost:3001/api/health](http://localhost:3001/api/health) → statut `ok` et base connectée.

### 3. Frontend

À la **racine** du dépôt :

```bash
cp .env.example .env
npm install
```

Laisser **`VITE_API_URL` vide** en local pour utiliser le proxy vers l’API.

```bash
npm run dev
```

Interface : [http://localhost:8080](http://localhost:8080).

### Tout lancer (API + Vite)

```bash
npm install
npm install --prefix server
npm run dev:full
```

---

## Docker

1. Optionnel : copier `.env.docker.example` vers `.env` et ajuster secrets, `APP_PORT`, etc.
2. Démarrer :

```bash
docker compose up --build -d
```

3. Application : [http://localhost:8080](http://localhost:8080) (selon `APP_PORT`).
4. Après stabilisation de MySQL :

```bash
docker compose exec app npm run seed:admin
```

Réinitialiser les données : `docker compose down -v` puis relancer.

Fichiers utiles : `Dockerfile`, `docker-compose.yml`, `.dockerignore`.

---

## Production

- Build frontend : `npm run build` → répertoire `dist/`.
- API seule : `cd server && npm install && npm start` (définir `CORS_ORIGIN` si le front est sur un autre domaine).
- **Monolithe recommandé** : `SERVE_STATIC_DIR` = chemin absolu vers `dist/`, une origine pour SPA + API.
- Front et API **séparés** : au build, `VITE_API_URL=https://api.exemple.com` puis `npm run build`.

Ne **jamais** commiter les fichiers `.env` contenant des secrets.

---

## Variables d’environnement

| Fichier | Rôle |
|---------|------|
| `server/.env` | Port, MySQL, `JWT_SECRET`, `CORS_ORIGIN`, `SEED_ADMIN_PASSWORD`, `SERVE_STATIC_DIR`, etc. |
| `.env` (racine, build Vite) | `VITE_API_URL` (vide en dev), **`VITE_SITE_URL`** (URL publique du site : SEO, Open Graph, URLs absolues) |
| Docker | Souvent dérivé de `.env.docker.example` |

---

## SEO & fichiers statiques

- Métadonnées par route via **react-helmet-async** ; les fiches destination injectent titre, description, **Open Graph** et **`og:locale`** (FR/EN).
- Avec **`VITE_SITE_URL`** défini au build, les balises **canonical** et **images OG** utilisent des URLs absolues.
- `public/robots.txt` et `public/sitemap.xml` : adapter l’URL de base en production pour correspondre à `VITE_SITE_URL`.

---

## CI / GitHub Actions

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) s’exécute sur les branches **`main`** et **`master`** (push et pull requests) :

1. `npm ci`
2. `npm run check` → lint, build production, tests Vitest

---

## API (référence)

| Méthode | Chemin | Rôle |
|---------|--------|------|
| GET | `/api/health` | Santé + connexion MySQL |
| GET | `/api/destinations` | Liste des destinations |
| GET | `/api/map-markers` | Points pour la carte Leaflet |
| GET | `/api/suggestions?q=` | Suggestions IA (paramètre optionnel) |
| POST | `/api/search` | Enregistre une recherche (contexte hero ; JWT client optionnel) |
| POST | `/api/auth/register` | Inscription client → JWT |
| POST | `/api/auth/login` | Connexion → JWT |
| GET | `/api/auth/me` | Profil (JWT) |
| PATCH | `/api/auth/me` | Mise à jour nom / e-mail (JWT) |
| PATCH | `/api/auth/me/password` | Changement de mot de passe (JWT) |
| GET | `/api/notifications` | Notifications (JWT) |
| PATCH | `/api/notifications/:id/read` | Marquer une notification lue |
| POST | `/api/notifications/read-all` | Tout marquer lu |
| GET | `/api/favorites/keys` | Clés favoris (JWT) |
| GET | `/api/favorites` | Favoris enrichis (JWT) |
| POST | `/api/favorites` | Ajouter un favori (JWT) |
| DELETE | `/api/favorites` | Retirer un favori (JWT) |
| GET | `/api/admin/stats` | Statistiques (admin + JWT) |
| GET | `/api/admin/users` | Liste utilisateurs (admin) |
| GET | `/api/admin/searches` | Historique des recherches (admin) |
| POST | `/api/admin/notifications` | Envoyer une notification (admin) |

**Rôles** : `client` (inscription) et `admin` (compte créé via `seed:admin`). La route `/admin` côté SPA est protégée (rôle admin).

---

## Contribution

1. **Fork** ou branche depuis `main`.
2. Vérifier que **`npm run check`** passe localement.
3. **Pull request** vers [AyoubElKharraf/SmallWorld](https://github.com/AyoubElKharraf/SmallWorld).

---

## Licence

Usage selon les mainteneurs du projet ; consulter le fichier **`LICENSE`** à la racine s’il est présent.
