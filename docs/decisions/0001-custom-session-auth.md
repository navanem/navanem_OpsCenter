# 0001 — Custom session authentication (instead of Auth.js)

- Status: accepted
- Date: 2026-06-24

## Context

The foundation spec named Auth.js (NextAuth v5) for authentication. The project
runs on Next.js 16, where next-auth v5 is still in beta with unreliable support.

## Decision

Implement a lightweight, self-contained session mechanism:
- Passwords hashed with argon2 (`@node-rs/argon2`).
- Sessions are signed JWTs (`jose`, HS256) stored in an httpOnly, SameSite=Lax cookie.
- The Next.js 16 proxy (`proxy.ts`) verifies the cookie signature at the edge and redirects to `/login`.
- Server components resolve the full user (with role + permissions) from the DB.

## Consequences

- No external auth dependency; full control over the flow.
- We own security details (cookie flags, secret rotation, expiry).
- 2FA (next milestone) and invitations build on these primitives.
- If multi-provider SSO is needed later, revisit Auth.js.
