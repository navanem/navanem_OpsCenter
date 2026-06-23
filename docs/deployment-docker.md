# Docker Deployment

## Local development

The `docker-compose.yml` file provides the `db` service (PostgreSQL 16).
The Next.js application runs locally via `npm run dev` and connects to
the database exposed on port 5432.

```bash
docker compose up -d db
npm run dev
```

## Production (VPS)

To be completed in a later version: adding a containerised `app` service
(Next.js build in `standalone` mode) to `docker-compose.yml`,
production environment variables, and a reverse proxy.
