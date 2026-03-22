# SmallWorld (Voyageur)

Application web de **planification de voyage** : vitrine de destinations, **assistant IA** (suggestions d’itinéraires / restaurants), **carte interactive** (Leaflet), **authentification** (clients + administrateurs), **profil utilisateur**, **notifications** et **espace d’administration**.

Ce dépôt contient un **frontend** (React + Vite + TypeScript), une **API REST** (Node.js + Express) et des scripts **SQL** (MySQL).

---

## Sommaire

- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Démarrage en local](#démarrage-en-local)
- [Docker](#docker-déploiement-local--préproduction)
- [Production](#production)
- [Variables d’environnement](#variables-denvironnement)
- [CI / GitHub Actions](#ci--github-actions)
- [API (endpoints)](#api-endpoints)
- [Contribution & dépôt](#contribution--dépôt)

---

## Stack technique

### Frontend

| Catégorie | Outils |
|-----------|--------|
| **Langage** | [TypeScript](https://www.typescriptlang.org/) |
| **UI** | [React 18](https://react.dev/), [React Router](https://reactrouter.com/) |
| **Build & dev** | [Vite 5](https://vitejs.dev/), [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) |
| **Styles** | [Tailwind CSS](https://tailwindcss.com/), [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate), thème (couleurs / radius via `tailwind.config`) |
| **Composants** | [shadcn/ui](https://ui.shadcn.com/) (basé sur [Radix UI](https://www.radix-ui.com/)), [class-variance-authority](https://cva.style/), [Lucide React](https://lucide.dev/) (icônes) |
| **Données async** | [TanStack Query (React Query)](https://tanstack.com/query) |
| **Formulaires / validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/), [@hookform/resolvers](https://github.com/react-hook-form/resolvers) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Carte** | [Leaflet](https://leafletjs.com/), [react-leaflet](https://react-leaflet.js.org/), [leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) |
| **Internationalisation** | [i18next](https://www.i18next.com/), [react-i18next](https://react.i18next.com/), détection de langue navigateur |
| **SEO** | [react-helmet-async](https://github.com/staylor/react-helmet-async) |
| **PWA** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker, manifest) |
| **Notifications UI** | [Sonner](https://sonner.emilkowal.ski/) (toasts), toasts Radix/shadcn |
| **Qualité** | [ESLint 9](https://eslint.org/) (flat config), [Vitest](https://vitest.dev/) + Testing Library |

### Backend (API)

| Catégorie | Outils |
|-----------|--------|
| **Runtime** | [Node.js](https://nodejs.org/) (20+ recommandé) |
| **Framework** | [Express 4](https://expressjs.com/) |
| **Base de données** | [MySQL](https://www.mysql.com/) 8.x (schéma `utf8mb4`) via [mysql2](https://github.com/sidorares/node-mysql2) (pool) |
| **Auth** | [JSON Web Tokens](https://jwt.io/) ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)), mots de passe hachés avec [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| **Sécurité / HTTP** | [helmet](https://helmetjs.github.io/) (production), [cors](https://github.com/expressjs/cors), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |
| **Logs** | [morgan](https://github.com/expressjs/morgan) |
| **Config** | [dotenv](https://github.com/motdotla/dotenv) (`server/.env`) |

### DevOps

| Outil | Usage |
|-------|--------|
| [Docker](https://docs.docker.com/) | Image multi-étage : build Vite + image Node pour API + fichiers statiques |
| [Docker Compose](https://docs.docker.com/compose/) | Services `db` (MySQL 8.4) + `app` (API + SPA) |
| [concurrently](https://github.com/open-cli-tools/concurrently) | Script `npm run dev:full` (Vite + API en parallèle) |
| [GitHub Actions](https://github.com/features/actions) | CI : install, lint, build, tests (voir `.github/workflows/ci.yml`) |

---

## Architecture

- **Frontend** : SPA React ; en dev, **proxy Vite** (`vite.config.ts`) redirige `/api` vers `http://127.0.0.1:3001` (API Express).
- **Backend** : routes sous `/api` ; en production avec `SERVE_STATIC_DIR`, Express sert le build Vite (`dist/`) et les routes API sur le **même port**.
- **Base** : tables `users`, `destinations`, `map_markers`, `ai_suggestions`, `hero_searches`, `notifications`, etc. (voir `server/db/init.sql`).

---

## Prérequis

- **Node.js** 18+ (idéalement **20 LTS**, aligné sur la CI et le Dockerfile)
- **npm** (fourni avec Node)
- **MySQL** 8.x (ou 5.7 avec `utf8mb4`) — en local ou via Docker
- **Docker** + **Docker Compose v2** (optionnel, pour le mode conteneurisé)

---

## Démarrage en local

### 1. Base de données MySQL

Création de la base, des tables et des données de démo :

```bash
mysql -u root -p < server/db/init.sql
```

Sous Windows (PowerShell), vous pouvez utiliser le chemin complet vers `mysql` si besoin.

Si une base **existait déjà** sans tables d’authentification, exécutez aussi `server/db/migration_auth.sql` (voir commentaires dans le fichier).

### 2. API Express

```bash
cd server
copy .env.example .env
```

**Windows** : `copy` ; **macOS/Linux** : `cp .env.example .env`

Éditez `server/.env` : `DB_USER`, `DB_PASSWORD`, `DB_NAME` (par défaut `smallworld`), `PORT` (défaut `3001`), **`JWT_SECRET`** (chaîne longue et secrète en production).

Création d’un compte **administrateur** (après migration de la base) :

```bash
cd server
npm install
npm run seed:admin
```

Identifiants par défaut : `admin@voyageur.local` / mot de passe défini par `SEED_ADMIN_PASSWORD` dans `.env` (défaut `Admin123!`).

Lancer l’API :

```bash
npm run dev
```

Vérification : [http://localhost:3001/api/health](http://localhost:3001/api/health) doit indiquer `ok` et une base `connected`.

### 3. Frontend (Vite + React)

À la **racine** du projet :

```bash
copy .env.example .env
npm install
```

En développement, laissez **`VITE_API_URL` vide** : le proxy envoie `/api` vers l’API locale.

```bash
npm run dev
```

Interface : [http://localhost:8080](http://localhost:8080) (port défini dans `vite.config.ts`).

### Tout lancer en une commande (API + Vite)

Depuis la racine (MySQL doit tourner et `init.sql` être appliqué) :

```bash
npm install
npm install --prefix server
npm run dev:full
```

---

## Docker (déploiement local / préproduction)

Prérequis : [Docker](https://docs.docker.com/get-docker/) et Docker Compose v2.

1. (Optionnel) Copier `.env.docker.example` vers `.env` et ajuster mots de passe, `JWT_SECRET`, `APP_PORT`.
2. Démarrer :

```bash
docker compose up --build -d
```

3. Application : [http://localhost:8080](http://localhost:8080) (port configurable via `APP_PORT`). L’API et les fichiers statiques sont servis par le même conteneur (`SERVE_STATIC_DIR`).
4. Créer le compte admin une fois MySQL prêt :

```bash
docker compose exec app npm run seed:admin
```

Fichiers utiles : `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.docker.example`.

**Note** : le premier démarrage de MySQL peut prendre ~30 s. Le volume `mysql_data` conserve les données ; pour tout réinitialiser : `docker compose down -v` puis `up` à nouveau.

---

## Production

- **Build frontend** : `npm run build` → dossier `dist/`.
- **API seule** : `cd server && npm install && npm start` (définir `CORS_ORIGIN` vers l’URL du site si le front est sur un autre domaine).
- **Un seul processus (recommandé)** : définir `SERVE_STATIC_DIR` vers le chemin de `dist` et lancer l’API ; Express sert le SPA et l’API sur le même port (comme dans Docker).
- **Front et API sur des origines différentes** : dans `.env` du front au build, `VITE_API_URL=https://votre-api.example.com`, puis `npm run build`.

Ne commitez jamais les fichiers `.env` réels ; utilisez les `.env.example` comme modèles.

---

## Variables d’environnement

| Fichier | Rôle |
|---------|------|
| `server/.env` | Port API, MySQL (`DB_*`), `JWT_SECRET`, `CORS_ORIGIN`, `SEED_ADMIN_PASSWORD`, etc. |
| `.env` (racine) | `VITE_API_URL` (vide en dev), `VITE_SITE_URL` (SEO / Open Graph) |
| `.env` (Docker) | Dérivé de `.env.docker.example` pour Compose |

---

## CI / GitHub Actions

Le workflow `.github/workflows/ci.yml` s’exécute sur les branches `main` et `master` (push et pull requests) :

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm test` (Vitest)

---

## API (endpoints)

| Méthode | Chemin | Rôle |
|--------|--------|------|
| GET | `/api/health` | Santé + connexion MySQL |
| GET | `/api/destinations` | Liste des destinations |
| GET | `/api/map-markers` | Points pour la carte Leaflet |
| GET | `/api/suggestions?q=` | Suggestions IA (filtre optionnel) |
| POST | `/api/search` | Enregistre la recherche du hero (`{ "query": "..." }`) ; si JWT client, lie à `user_id` |
| POST | `/api/auth/register` | Inscription client (`email`, `password`, `name`) → JWT |
| POST | `/api/auth/login` | Connexion → JWT |
| GET | `/api/auth/me` | Profil (JWT requis) |
| PATCH | `/api/auth/me` | Mise à jour nom / e-mail (JWT) → nouveau jeton |
| PATCH | `/api/auth/me/password` | Changement de mot de passe (`currentPassword`, `newPassword`) |
| GET | `/api/notifications` | Notifications du client (JWT) |
| PATCH | `/api/notifications/:id/read` | Marquer une notification lue |
| POST | `/api/notifications/read-all` | Tout marquer lu |
| GET | `/api/admin/stats` | Statistiques (admin + JWT) |
| GET | `/api/admin/users` | Liste des utilisateurs (admin) |
| GET | `/api/admin/searches` | Historique des recherches (admin) |
| POST | `/api/admin/notifications` | Envoyer une notification (`title`, `body`, `type`, `broadcastToAll` ou `userId`) |

**Rôles** : `client` (inscription) et `admin` (créé via `seed:admin`). La route `/admin` côté SPA est réservée aux administrateurs.

---

## Contribution & dépôt

- Projet : **Voyageur** (nom utilisateur) / **SmallWorld** (nom du code / dépôt).
- Dépôt GitHub : [https://github.com/AyoubElKharraf/SmallWorld](https://github.com/AyoubElKharraf/SmallWorld)

Pour proposer des modifications : fork, branche dédiée, pull request. La CI doit passer (lint, build, tests).

---

## Licence

Projet privé / usage selon les choix des mainteneurs ; voir le fichier `LICENSE` s’il est présent à la racine.
