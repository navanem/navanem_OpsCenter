# OpsCenter

SaaS management platform for MSPs (single-tenant).

## Stack

Next.js (App Router, TypeScript) · PostgreSQL · Prisma · Tailwind CSS · Docker.

## Prerequisites

- Node.js 20
- Docker Desktop

## Development quickstart

```bash
# 1. Install dependencies
npm install

# 2. Start the database
docker compose up -d db

# 3. Copy environment variables
cp .env.example .env

# 4. Apply migrations
npx prisma migrate dev

# 5. Start the application
npm run dev
```

The application is available at http://localhost:3000.

## Tests

```bash
npm run test
```

## Documentation

- Foundation spec: `docs/internal/specs/2026-06-23-opscenter-foundation-design.md`
- Docker deployment: `docs/deployment-docker.md`
