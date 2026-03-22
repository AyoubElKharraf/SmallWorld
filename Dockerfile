# Build frontend (Vite) puis image Node pour API + fichiers statiques
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.ts postcss.config.js components.json ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:20-bookworm-slim AS production
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/src ./src
COPY server/scripts ./scripts
COPY server/db ./db
COPY --from=frontend-build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3001
ENV SERVE_STATIC_DIR=/app/dist

EXPOSE 3001
CMD ["node", "src/index.js"]
