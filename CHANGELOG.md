# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and semantic versioning.

## [0.60.0] - 2026-06-27

### Added
- CRM expected-close aging: open opportunities past their expected close date are now flagged as **overdue** — a red badge on pipeline board cards, a red date in the list view, and an overdue count shown under the Open deals KPI. Helps surface stalled deals that need attention. Bilingual EN/FR.

## [0.59.0] - 2026-06-27

### Added
- CRM pipeline board now has **inline Won / Lost actions** on each opportunity card — mark a deal won or lost (or reopen it) in one click without leaving the board, with optimistic UI and an audit-log entry.
- **Weighted forecast** KPI (Σ value × win probability over open deals) shown under the Pipeline value card, giving a probability-adjusted revenue projection.

## [0.58.0] - 2026-06-27

### Added
- CRM pipeline board: the CRM → Pipeline tab now offers a **drag-and-drop Kanban board** grouping opportunities into columns by stage (plus an Unassigned column), with per-column deal counts and total value. Drag a card to move the opportunity to another stage (recorded in the audit log). A **Board / List** toggle switches between the board and the existing table while preserving active filters. Bilingual EN/FR.

## [0.57.0] - 2026-06-27

### Added
- CRM / sales pipeline module (toggle in Settings → CRM): manage **leads** (LEAD-####) with source, status, owner, contact details and estimated value, and **opportunities** (OPP-####) through a configurable pipeline with stages, monetary value, win probability, owner, expected close date and won/lost outcome. One-click **convert a qualified lead into a client** (carrying over company and contact details). Tabbed CRM view (Pipeline / Leads) with KPIs (open deals, pipeline value, won deals, active leads) and filters. Pipeline stages, lead sources and lead statuses are managed in Settings → Taxonomies. Actions recorded in the audit log. Gated by dedicated "View CRM" / "Manage CRM" permissions. Bilingual EN/FR.

## [0.56.0] - 2026-06-27

### Added
- CMDB / Configuration Management module (toggle in Settings → CMDB): track configuration items (CI-####) — servers, applications, services, network gear — with configurable type and status, owner, environment, location, client, an optional linked monitored device, and CI-to-CI relationships. Includes a list with KPIs and filters, plus CI types/statuses managed in Settings → Taxonomies. Actions recorded in the audit log. Gated by dedicated "View CMDB" / "Manage CMDB" permissions. Bilingual EN/FR.

## [0.55.0] - 2026-06-27

### Added
- ITSM Change Management module (toggle in Settings → Changes): plan and track IT changes (CHG-####) with configurable type and status, risk/impact, planned window, implementation and rollback plans, assignee and client, plus an approve/reject workflow gated by a dedicated permission. Includes a list with KPIs and filters. Bilingual EN/FR.

## [0.54.0] - 2026-06-27

### Added
- Device monitoring agent: each device now has a detail page showing live system metrics (online/offline status, OS, CPU, memory, disk, IP, last seen) with usage gauges. Generate a per-device token and deploy the provided PowerShell (Windows) or bash (Linux/macOS) agent on the workstation; it reports metrics to a token-authenticated API endpoint.

## [0.53.0] - 2026-06-27

### Added
- Audit log (Settings → Audit log): a chronological record of who did what and when across the app, with entity/action filters and search. The framework records actions best-effort and currently covers clients, devices, subscriptions, contracts, knowledge articles, ticket create/status/assignment and user suspension; more actions are being instrumented over time. Gated by a new "View audit log" permission.

## [0.52.0] - 2026-06-27

### Added
- ITSM ticket types: classify tickets as Incident, Service request, Change (configurable in Settings → Taxonomies → Ticket types). The type shows on the ticket list and detail, can be filtered, and is set on creation or inline on the ticket.

## [0.51.0] - 2026-06-27

### Changed
- The Ticket, Subscription, Device and Knowledge base create/edit forms (field labels, options, hints and buttons) now follow the chosen French / English language.

## [0.50.0] - 2026-06-27

### Changed
- Completed French / English coverage of the main pages: Timesheets, Users and Roles (titles, buttons, KPIs, table headers, status labels and filters) now follow the chosen language.

## [0.49.0] - 2026-06-27

### Added
- App footer: "Navanem OpsCenter by Sunitech", version, a link to sunitech.ch and the copyright, shown across the app and the client portal.

### Changed
- More French / English coverage: ticket statuses (list, board, detail, dashboard, portal) plus the Projects and Knowledge base pages and filters now follow the chosen language.

## [0.48.0] - 2026-06-27

### Changed
- Extended the French / English translation to the module pages: Tickets, Clients, Planning, Contracts, Subscriptions and Devices — their titles, buttons, KPIs, table headers, empty states and filters now follow the chosen language.

## [0.47.0] - 2026-06-27

### Changed
- Rewrote the README with a feature-by-feature overview and product screenshots.

## [0.46.0] - 2026-06-27

### Added
- Starter roles seeded out of the box: Manager (runs operations and the team, no system configuration) and Technician (day-to-day operations, no access to settings) — alongside the full-access Admin.
- User menu in the top bar: click your avatar to switch language and light/dark theme, open security settings, or sign out.

### Changed
- Sidebar navigation is now grouped into logical sections (Operations, Customers, System).

## [0.45.0] - 2026-06-27

### Changed
- Planning is now a full month calendar (previous/next month, Today, localized month and weekday names) with colored event chips per visit type, today highlighted, and a "+N more" overflow — replacing the week strip.
- Refreshed the Clients list: each row shows a colored initials avatar with company name and domain, a status pill, and view/edit action icons, with row hover.

## [0.44.0] - 2026-06-26

### Added
- New Subscriptions module (toggle in Settings → Subscriptions) to manage recurring subscriptions, renewals, warranties and support plans per client: type & status (configurable in Settings → Taxonomies), provider, cost & billing cycle, seats, start/renewal/coverage dates, auto-renew and support level. Includes a list with KPIs and filters, per-client section, and a dashboard "Subscriptions renewing" alert for the next 30 days.

## [0.43.0] - 2026-06-26

### Added
- Bilingual interface (English / French), chosen per user in Settings → Language and remembered on your account. Admins set the default language for new users and the client portal. Client-portal users can switch language from the portal header. This release translates the navigation, top bar, dashboard, sign-in, settings, and the client portal; the remaining module pages are being translated next.

## [0.42.0] - 2026-06-26

### Added
- Light / dark theme toggle in the top bar. Your choice is remembered, and the page loads in the right theme with no flash.

### Changed
- Redesigned the Settings → Taxonomies and Contract types editors: each entry is now a clean single-row table (color, name, order, active, save, delete) with column headers, instead of a tall stacked form per item.

## [0.41.0] - 2026-06-26

### Changed
- Redesigned the ticket detail page for a cleaner, less cluttered right column: editable fields (status, priority, assignee, due date, device, tags) now save instantly on change instead of each having its own form and "Update" button, the duplicated read-only/edit fields were merged, and the activity timeline moved to the main column where it reads at full width.

## [0.40.0] - 2026-06-26

### Added
- Import clients from a CSV file (Clients → Import CSV). Recognizes Company (required), Domain and Status columns; validates each row, imports the valid ones, and reports any skipped rows with the reason.

## [0.39.0] - 2026-06-26

### Added
- CSV export extended to the Tickets list and (for managers) the Timesheets list. Timesheets export requires the "view all" permission and the Timesheeting module enabled.

## [0.38.0] - 2026-06-26

### Added
- Export to CSV from the Clients, Devices, and Contracts lists (Excel-friendly UTF-8). Each export respects module-enabled state and your permissions.

## [0.37.0] - 2026-06-26

### Added
- Dashboard "Attention needed" section surfaces contracts ending within 30 days and device warranties expiring within 60 days, each linking to the record. Shown per module enabled + permission.

## [0.36.0] - 2026-06-26

### Added
- Knowledge base in the client portal: staff can flag a published article "Visible in client portal", and clients can then browse and read those articles (with search) from a new Knowledge base tab in their portal. Drafts and unflagged articles are never exposed.

## [0.35.0] - 2026-06-26

### Added
- The Clients list now shows monthly recurring revenue (MRR) and device count per client, plus a total-MRR KPI. Columns appear only when the Contracts / Devices modules are enabled and you have permission to see them.

## [0.34.0] - 2026-06-26

### Added
- Admins can require two-factor authentication for all users (Settings → Security → Organization policy). When on, anyone without 2FA is sent to a setup screen before they can use the app; backup codes ensure no one is locked out.

## [0.33.0] - 2026-06-26

### Added
- Contract ↔ timesheets linkage: a contract with an included-hours quota now shows a "Time usage" card on its page — logged time for the client this billing period vs the included hours, with a progress bar (green / amber near limit / red over).

## [0.32.0] - 2026-06-26

### Added
- Clients list now shows KPIs (total, active, unassigned, open tickets) and a per-client open-ticket count column.
- "New ticket for this device" on the device page pre-fills the client and links the device on the new ticket.

### Changed
- Premium client detail header: initials avatar, status, and quick stats (open tickets, projects, devices, contacts).

## [0.31.0] - 2026-06-26

### Added
- Module linkage: a ticket can be linked to a device (the asset it concerns), chosen from the ticket's client devices on the ticket detail; the device page lists its related tickets.
- The dashboard now shows an "Across your modules" KPI row (projects, visits this week, monthly recurring contract value, devices, knowledge articles) — each card appears only for enabled modules the user can access.

### Changed
- Premium navigation: the sidebar now has icons and a refined active state.

## [0.30.0] - 2026-06-26

### Added
- Device / asset management module (toggle on/off in Settings → Devices): track managed devices (laptops, servers, network gear, printers…) with configurable type and status, serial number, manufacturer/model, hostname, purchase and warranty dates, and client assignment. List with KPIs (total, assigned, unassigned, warranty expiring within 60 days), filters, a devices section on the client detail, and warranty highlighting. RBAC-gated by `devices.*` permissions.

## [0.29.0] - 2026-06-26

### Added
- Knowledge base module: write and maintain internal articles (how-tos, troubleshooting, tips & tricks, policies) with Markdown content, configurable categories (Settings → Taxonomies), draft/published status, and full-text search. Drafts are visible to editors only. RBAC-gated by `knowledge.*` permissions.

## [0.28.0] - 2026-06-26

### Added
- Two-factor authentication now issues 10 one-time backup codes when you enable it (shown once, stored hashed). At sign-in you can enter a backup code instead of an authenticator code if you lose your device, and each is consumed on use. Backup codes can be regenerated from Settings → Security with a current code.

## [0.27.0] - 2026-06-26

### Added
- Optional two-factor authentication (TOTP): users enable an authenticator app from Settings → Security (scan a QR, verify a code). When enabled, sign-in asks for a 6-digit code as a second step. Secrets are encrypted at rest; disabling requires a current code.

## [0.26.0] - 2026-06-26

### Added
- Invitation lifecycle management on Settings → Users: pending invitations show as "Invite expired" once past their expiry, and can be **resent** (fresh link, old one revoked) or **revoked** (cancels the pending invite and removes the placeholder account). Resending/revoking writes the proper REVOKED status.

## [0.25.0] - 2026-06-26

### Added
- Per-contact client portal permissions: each contact can be allowed (or not) to create tickets and to reply on tickets, set from the contact form. Viewing their company's tickets remains the baseline. The portal hides and enforces these capabilities accordingly.

## [0.24.0] - 2026-06-26

### Added
- Dashboard now opens with a "My work" section for the signed-in user: their open tickets, upcoming tasks, and upcoming visits.

### Changed
- Contract types are now managed as a tab in Settings → Taxonomies (consistent with the other taxonomies).
- Time entries can be edited directly from the time-tracking panel on tickets/tasks/visits (and editing returns you to where you started).
- The time-tracking panel on the ticket detail sits in the right column above the ticket properties (no longer full-width).

## [0.23.0] - 2026-06-26

### Added
- Client portal: a separate, external-facing area where client contacts sign in (own session) to view their company's tickets, open new tickets, and reply on the conversation. Staff grant or revoke portal access per contact from the client detail (an email link lets the contact set their password). Portal sessions are isolated from staff sessions, and a portal user can only ever see their own client's data.

## [0.22.0] - 2026-06-26

### Changed
- Refreshed KPI cards across the dashboard, tickets, projects, contracts, and timesheets with a cleaner, consistent `StatCard` design (colored accent, soft glow, tabular figures, hover state).

## [0.21.0] - 2026-06-26

### Added
- Configurable ticket tags (managed in Settings → Taxonomies): tag tickets on creation or from the detail, see colored tag chips in the list and detail, and filter the ticket list by tag.

## [0.20.0] - 2026-06-26

### Added
- The monthly client timesheet report can now be **downloaded as a server-generated PDF** (`pdf-lib`) and **emailed as a PDF attachment** to a recipient (defaulting to the client's contact email) when SMTP is configured. The browser "Print" option remains available.

## [0.19.0] - 2026-06-26

### Added
- Quick-assign a technician directly from the project Kanban task cards and from the planning week calendar visit cards, gated by the `projects.assign` / `visits.assign` permissions.

## [0.18.0] - 2026-06-26

### Added
- Self-service **password reset**: a "Forgot password?" link on sign-in leads to a request form that emails a time-limited (1 hour) reset link; the reset page sets a new password. Tokens are single-use and sha256-hashed at rest, the request form never reveals whether an email exists, and outstanding tokens are invalidated on use. When SMTP is not configured, the reset link is logged to the server console (dev fallback). Honors `APP_URL` for the link host.

## [0.17.0] - 2026-06-26

### Added
- Tickets now have a **due date**, set on creation or from the ticket detail. Overdue open tickets are flagged with a badge, shown in red in the list, and counted in a new "Overdue" KPI.
- **Email notifications** for ticket events (assigned, new comment, status change) sent to the assignee and creator (excluding the actor) when SMTP is configured. Set `APP_URL` so the email links resolve to your deployment (defaults to `http://localhost:3000`).

## [0.16.0] - 2026-06-26

### Added
- Project Kanban board now supports drag-to-reorder tasks within a column (and still across columns), with the order persisted.
- A task can be deleted from its edit page.

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
