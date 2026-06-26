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

## Features

- **Authentication** — email/password login, signed-cookie sessions, route protection, self-service password reset (emailed, time-limited, single-use hashed tokens), and optional two-factor authentication (TOTP authenticator app, encrypted secret, second-step code at sign-in).
- **Client portal** — a separate external area (`/portal`) where client contacts sign in with their own session to view their company's tickets, open new tickets, and reply on the conversation. Staff grant/revoke portal access per contact from the client detail. Portal sessions are isolated from staff sessions and strictly scoped to the contact's own client.
- **RBAC** — role-based permission catalog with a `can()` helper and per-route permission guards.
- **Clients** — RBAC-gated client management (`clients.read` to view, `clients.manage` to create/edit/delete); list with search and status/technician filters, create/edit form, and detail page.
- **Client contacts** — manage the people at each client (name, job title, email, phone) with an optional photo and a VIP flag; contacts are shown on the client detail page and gated by `clients.manage`.
- **Users & Roles** — managed under Settings; invite users with a copyable setup link, edit or suspend accounts, and configure roles with a full permission matrix. RBAC-gated by `users.*` / `roles.*` permissions.
- **Settings** — company identity (name and logo displayed in the app shell); SMTP configuration stored in the database with the password encrypted at rest (AES-256-GCM, key derived from `AUTH_SECRET`) and a "send test email" action; invitation emails sent automatically when SMTP is configured (copyable link remains as a fallback). Gated by `settings.manage`.
- **Tickets** — linked to clients with status, priority, category, due dates (with overdue flagging), and human-friendly reference numbers (TKT-####); filterable list view with KPIs and a drag-and-drop Kanban board grouped by status; ticket detail with a threaded comment conversation and an automatic activity log; optional email notifications (assigned / commented / status changed) when SMTP is configured. RBAC-gated by `tickets.*` permissions.
- **Taxonomies** — configurable ticket categories, ticket priorities (label, color, sort order, active flag), and client industries managed in Settings → Taxonomies; clients can be assigned a configurable industry. Gated by `settings.manage`.
- **Projects** — project management module: projects linked to clients with a lead, dates, and tasks; a filterable projects list; a project detail with four task views — List, Kanban Board (drag-and-drop to move tasks between statuses), Timeline (Gantt), and Calendar; configurable project and task statuses managed in Settings → Taxonomies. RBAC-gated by `projects.*` permissions.
- **Planning** — schedule one-off and recurring visits (e.g. client support, office support) for technicians on a week calendar; recurring templates (daily/weekly/monthly) generate dated occurrences you can reschedule, complete, or cancel individually; configurable visit types managed in Settings → Taxonomies. RBAC-gated by `visits.*` permissions.
- **Timesheeting** _(optional — toggle in Settings → Timesheets)_ — log time against tickets, project tasks, visits, or a client via a manual entry form or a live start/stop timer; billable flag and an hourly rate per entry (inherited from the client's contract type, with a global default fallback); a submit → approve/reject workflow with a dedicated approvals queue; a "My timesheets" view with KPIs and a manager-wide view; and a monthly per-client report (Timesheets → Reports) downloadable as a server-generated PDF or emailed as a PDF attachment. A time-tracking panel is embedded on ticket, task, and visit pages. RBAC-gated by `timesheets.*` permissions; hidden everywhere when the module is disabled.
- **Contracts** _(optional — toggle in Settings → Contracts)_ — client contracts with a configurable type (Support, Maintenance, Infogérance…) carrying a default hourly rate, a configurable status, value, billing cycle (monthly/quarterly/yearly/one-off), and an included-hours quota; a contracts list with KPIs (count, monthly recurring value, total value, expiring soon) and a section on the client detail. RBAC-gated by `contracts.*` permissions; hidden everywhere when the module is disabled.
- **Knowledge base** — internal articles (how-tos, troubleshooting, tips & tricks, policies) written in Markdown, with configurable categories, draft/published status, and search. Drafts are visible to editors only. RBAC-gated by `knowledge.*` permissions.
- **Dashboard** — a "My work" panel (your tickets, tasks, and visits) plus KPI cards (total clients, open/total tickets, team size), tickets-by-status breakdown, and a recent-tickets list at a glance.
- **Refreshed UI** — premium visual pass across the entire app: tighter corner radius, crisper borders, refined buttons/cards, and active-state sidebar navigation.
- **Breadcrumbs** — contextual breadcrumb trail across all main sections for clearer navigation.
- **Client detail** — full-width layout listing the client's open and closed tickets inline.

## Tests

```bash
npm run test
```

## Documentation

- Foundation spec: `docs/internal/specs/2026-06-23-opscenter-foundation-design.md`
- Docker deployment: `docs/deployment-docker.md`
- ADR — custom session auth: `docs/decisions/0001-custom-session-auth.md`
