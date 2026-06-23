# OpsCenter

Plateforme SaaS de gestion pour MSP (mono-tenant).

## Stack

Next.js (App Router, TypeScript) · PostgreSQL · Prisma · Tailwind CSS · Docker.

## Prérequis

- Node.js 20
- Docker Desktop

## Démarrage (développement)

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer la base de données
docker compose up -d db

# 3. Copier les variables d'environnement
cp .env.example .env

# 4. Appliquer les migrations
npx prisma migrate dev

# 5. Lancer l'application
npm run dev
```

L'application est disponible sur http://localhost:3000.

## Tests

```bash
npm run test
```

## Documentation

- Spec de fondation : `docs/internal/specs/2026-06-23-opscenter-foundation-design.md`
- Déploiement Docker : `docs/deploiement-docker.md`
