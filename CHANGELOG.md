# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and semantic versioning.

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
