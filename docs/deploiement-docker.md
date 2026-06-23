# Déploiement Docker

## Développement local

Le fichier `docker-compose.yml` fournit le service `db` (PostgreSQL 16).
L'application Next.js tourne en local via `npm run dev` et se connecte à
la base exposée sur le port 5432.

```bash
docker compose up -d db
npm run dev
```

## Production (VPS)

À compléter dans une version ultérieure : ajout d'un service `app`
conteneurisé (build Next.js en mode `standalone`) au `docker-compose.yml`,
variables d'environnement de production, et reverse proxy.
