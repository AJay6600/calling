# AGENTS.md

Standing project context for AI coding agents working in this repo. Read this before making changes.

## Project

AI Outbound Calling SaaS Platform — a multi-tenant product where businesses upload lead lists and an AI agent (via Bolna Voice AI) places or bulk-dispatches phone calls, tracking outcomes and billing usage by calling seconds.

## Monorepo structure

Nx + Yarn, **integrated style** (single root `package.json`). All dependencies install at the repo root.

```
apps/
  web/       React 19 + Vite + Apollo Client + antd — org-facing dashboard
  api/       Express REST + Apollo Server GraphQL — auth, Bolna calls, Hasura admin ops
  backend/   Docker Compose (Postgres, Hasura, Redis, pgAdmin) + Hasura migrations/metadata
libs/
  types/     Shared TypeScript types across web/api/worker
```

`apps/worker` (BullMQ) does not exist yet — deferred until the bulk-calling/campaigns phase.

## Running things

```bash
yarn nx run backend:start:local
yarn nx run backend:hasura-migrate
yarn nx run backend:hasura-metadata-apply
yarn nx run backend:stop:local
yarn nx run backend:destroy:local   # wipes volumes, use for a clean DB

yarn nx run web:serve
yarn nx run api:serve
```

## Local infra

- Postgres, Hasura, Redis, pgAdmin run via Docker Compose in `apps/backend/Compose.local.yml`.
- Use `yarn nx run backend:*` Nx targets — do not run `docker compose` directly.
- `api`/`web` connect to Hasura via `localhost:8080` (they run on the host, not in Docker).
- pgAdmin connects to Postgres via Docker hostname `postgres`, not `localhost`.

## Database (Hasura + PostgreSQL)

- **Schema source of truth:** `apps/backend/hasura/migrations/`
- **Table permissions / tracking:** `apps/backend/hasura/metadata/`
- After schema changes: create migration → `yarn nx run backend:hasura-migrate` → update metadata → `yarn nx run backend:hasura-metadata-apply`
- Tables: `organizations`
- Web reads/writes via Apollo Client → Hasura GraphQL
- API uses `hasuraClient.ts` (admin secret) for server-side ops like org JIT provisioning
- Prisma has been removed — do not reintroduce it

## Auth

**Zitadel Cloud** (OIDC), not Clerk.

- Frontend: `react-oidc-context` in `apps/web/src/component/AppOidcProvider.tsx`
- Backend: `jose` JWT verification in `apps/api/src/middleware/zitadel-auth.middleware.ts`
- Hasura uses `anonymous` role for local dev; production needs JWT mode with Zitadel claims for RLS

## Frontend folder convention (`apps/web/src`)

```
pages/       One component per route
component/   Reusable shared components
graphql/     Hasura GraphQL queries/mutations/subscriptions
lib/         Apollo Client setup
utils/       Helpers, types, API client
```

## Environment variables

Each app has its own `.env.example` — copy to `.env` locally, never commit `.env`.

## Where the full spec lives

The complete product design doc (architecture, phased build plan, Bolna/Razorpay evaluation) is tracked outside this repo — ask before assuming details about later phases that aren't reflected in code yet.
