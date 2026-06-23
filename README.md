# OpsCenter

SaaS management platform for MSPs (single-tenant).

## Stack

Next.js (App Router, TypeScript) · PostgreSQL · Prisma · Tailwind CSS · Docker.

## Prerequisites

- Node.js 20
- Docker Desktop

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable         | Description                                      |
|------------------|--------------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string (set by Docker).    |
| `AUTH_SECRET`    | Secret key used to sign session JWTs (≥ 32 chars). |
| `ADMIN_EMAIL`    | Email for the bootstrap admin (used by seed).    |
| `ADMIN_PASSWORD` | Password for the bootstrap admin (used by seed). |

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

# 5. Seed the database (permissions, Admin role, bootstrap admin user)
npm run db:seed

# 6. Start the application
npm run dev
```

The application is available at http://localhost:3000.

Sign in at `/login` with the seeded admin account:
- Email: `admin@opscenter.local` (or the value of `ADMIN_EMAIL` in `.env`)
- Password: `ChangeMe123!` (or the value of `ADMIN_PASSWORD` in `.env`)

## Tests

```bash
npm run test
```

## Documentation

- Foundation spec: `docs/internal/specs/2026-06-23-opscenter-foundation-design.md`
- Docker deployment: `docs/deployment-docker.md`
- ADR — custom session auth: `docs/decisions/0001-custom-session-auth.md`
