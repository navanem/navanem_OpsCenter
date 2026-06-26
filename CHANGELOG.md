# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and semantic versioning.

## [0.15.0] - 2026-06-26

### Added
- Project detail now offers four task views: **List**, **Board**, **Timeline** (Gantt-style bars across the project's date range, colored by status), and **Calendar** (month grid with tasks on their due dates, navigable by month).

## [0.14.0] - 2026-06-26

### Added
- Contracts module (toggle on/off in Settings → Contracts): client contracts with a type, a configurable status, value, billing cycle (monthly/quarterly/yearly/one-off), and an included-hours quota per period.
- Configurable **contract types** with a default hourly rate (Support, Maintenance, Infogérance, …), managed in Settings → Contract types; **contract statuses** managed as a taxonomy.
- Contracts list with KPIs (count, monthly recurring value, total value, expiring within 30 days), filters, and a Contracts section on the client detail.
- New RBAC permissions: `contracts.read`, `contracts.manage`.
- Hourly rates now live on contract types: new time entries inherit the rate from the client's active contract, falling back to a global default rate set in Settings → Timesheets.
- Monthly per-client timesheet report (Timesheets → Reports) with hours and billable amounts, exportable as PDF via the browser (Save as PDF).

### Changed
- Timesheeting settings moved to their own Settings → Timesheets page (was under General).
- The time-tracking panel now sits at the top of the ticket detail page; refreshed timesheets/timer visuals.

## [0.13.0] - 2026-06-26

### Added
- Timesheeting module (toggle on/off in Settings → General): log time against tickets, project tasks, visits, or a client, with a manual entry form or a live start/stop timer.
- Billable flag and hourly rate per entry, plus a submit → approve/reject workflow; approvers review submitted time at Timesheets → Approvals.
- "My timesheets" page with KPIs (total/billable time, submitted, approved), status filters, and an everyone view for managers.
- Time-tracking section embedded on ticket, project task, and visit pages.
- New RBAC permissions: `timesheets.read`, `timesheets.read.all`, `timesheets.approve`.
- Projects list now shows KPIs (total projects, tasks, no-lead, overdue).
- Client detail now lists the client's projects and upcoming visits.

## [0.12.0] - 2026-06-26

### Added
- Planning & dispatch: schedule visits (e.g. client support, office support) for technicians, shown on a week calendar.
- Recurring visit templates (daily/weekly/monthly) that generate dated visit occurrences you can reschedule, complete, or cancel individually.
- Configurable visit types (managed in Settings → Taxonomies).
- New RBAC permissions: `visits.read`, `visits.manage`, `visits.assign`.

## [0.11.0] - 2026-06-26

### Added
- Project management: projects linked to clients with a lead, dates, and tasks. Configurable project and task statuses (managed in Settings → Taxonomies).
- Projects list with filters, a project detail with an overview, and List and Kanban Board task views (drag-and-drop to change a task's status).
- New RBAC permissions: `projects.read`, `projects.manage`, `projects.assign`.

## [0.10.0] - 2026-06-25

### Added
- Dashboard with KPIs (clients, open/total tickets, team), a tickets-by-status breakdown, and a recent-tickets list.

### Changed
- Premium visual refresh across the app: tighter corner radius, crisper borders, refined buttons/cards, and active-state sidebar navigation.
- Settings → Taxonomies is now organized into tabs.

## [0.9.0] - 2026-06-25

### Added
- Client contacts: manage the people at each client (name, job title, email, phone) with an optional photo and a VIP flag, shown on the client detail page.

## [0.8.0] - 2026-06-25

### Added
- Configurable taxonomies managed in Settings: ticket categories, ticket priorities (label, color, sort order, active flag), and client industries.
- Clients can be assigned a configurable industry.

### Changed
- Ticket categories and priorities are now database-backed and editable instead of fixed values (existing tickets were migrated to the defaults).

## [0.7.0] - 2026-06-25

### Added
- Breadcrumbs across the application for clearer navigation.
- The client detail page now uses the full width and lists the client's open and closed tickets.

### Changed
- Premium visual pass on the ticket list, Kanban board, and detail views.

## [0.6.0] - 2026-06-24

### Added
- Ticketing: tickets linked to clients with status, priority, and category, and human-friendly reference numbers (TKT-####).
- A filterable ticket list and a drag-and-drop Kanban board grouped by status.
- Ticket detail with a threaded comment conversation and an automatic activity timeline (status, priority, assignment, comments).
- New RBAC permissions: `tickets.read`, `tickets.manage`, `tickets.assign`.

## [0.5.0] - 2026-06-24

### Added
- Application settings: company name and logo (shown in the app shell).
- SMTP configuration stored in the database with the password encrypted at rest (AES-256-GCM), plus a "send test email" action.
- Nodemailer mailer using the stored SMTP settings.
- Invitation emails: when SMTP is configured, the setup link is emailed to the invited user (the copyable link remains as a fallback).

## [0.4.0] - 2026-06-24

### Added
- Roles management with a permission matrix (create, edit, delete roles; assign permissions per role).
- User management (invite/edit/suspend) with a copyable setup link for onboarding new users.
- Public accept-invitation flow: invited users set a password to activate their account.
- Last-active-admin lockout protection (blocks suspend and role demotion that would remove the last admin).

### Notes
- Invite emails are deferred to v0.5.0 (SMTP); admins copy the setup link manually for now.

## [0.3.0] - 2026-06-24

### Added
- Clients module: data model with a `domain` field (reserved for the future Tickets module) and an assigned-technician relation.
- Clients list with search and status/technician filters, create/edit form, and detail page.
- Reusable permission guards (`requireUser`, `requirePermission`) and a permission-aware sidebar.

## [0.2.0] - 2026-06-24

### Added
- User, Role and Permission data model with a fixed RBAC permission catalog.
- Database seed creating the permissions, an Admin system role, and a bootstrap admin user.
- Email + password authentication with argon2 hashing and signed-cookie sessions.
- Login page, sign-out, and proxy route protection covering all app routes.
- `can()` RBAC helper.

### Changed
- Switched all UI and documentation from French to English.

## [0.1.0] - 2026-06-23

### Added
- Next.js foundation (App Router, TypeScript) with Tailwind CSS.
- Premium dark theme and base UI components (Button, Card).
- PostgreSQL database via Docker and Prisma client.
- App shell with navigation sidebar and dashboard page.
- Testing tooling (Vitest).
- Getting-started and deployment documentation.
