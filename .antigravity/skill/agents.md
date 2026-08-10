# AGENTS.md

Standing project context for AI coding agents (Antigravity, Claude Code, Codex, etc.) working in this repo. Read this before making changes.

## Project

AI Outbound Calling SaaS Platform — a multi-tenant product where businesses upload lead lists and an AI agent (via Bolna Voice AI) places or bulk-dispatches phone calls, tracking outcomes and billing usage by calling seconds.

## Monorepo structure

Nx + Yarn, **integrated style** (single root `package.json`, no per-app `package.json`, no Yarn workspaces protocol). All dependencies install at the repo root — never use `yarn workspace <name> add`, just `yarn add <package>` from root.

```
apps/
  web/            React 19 + Vite + TypeScript + antd — the org-facing dashboard
  api/             NestJS backend — auth, leads, campaigns, billing, Bolna/Razorpay webhooks
  backend/         Docker Compose only (Postgres, Redis, pgAdmin) — no app code, shared local infra for api/worker
libs/
  types/           Shared TypeScript types across web/api/worker
  prisma/          Single source of DB schema (schema.prisma) + generated Prisma Client, shared by api/worker
```

`apps/worker` (BullMQ) does not exist yet — deferred until the bulk-calling/campaigns phase.

## Running things

```bash
yarn nx run backend:start:local     # start Postgres + Redis + pgAdmin (Docker)
yarn nx run backend:stop:local
yarn nx run backend:destroy:local   # wipes volumes, use for a clean DB

yarn nx run prisma:db-push          # sync schema to local Postgres
yarn nx run prisma:generate         # regenerate Prisma Client after schema changes
yarn nx run prisma:studio

yarn nx run web:serve
yarn nx run api:serve
```

`yarn nx show projects` lists all registered project names if a command doesn't resolve.

## Local infra

- Postgres, Redis, pgAdmin run via Docker Compose defined in `apps/backend/compose.local.yml`, driven only through the Nx targets above — do not run `docker compose` directly, use the `yarn nx run backend:*` commands so the project name/flags stay consistent.
- `api`/`worker` connect to Postgres/Redis via `localhost` (they run on the host, not in Docker).
- pgAdmin (accessed in-browser at `localhost:5433`) connects via the Docker network hostname `postgres`, not `localhost` — this is a real, intentional difference, not a bug.
- Credentials live in `apps/backend/.env` (gitignored; template in `.env.example`).

## Database (Prisma)

- Schema: `libs/prisma/prisma/schema.prisma`. `datasource` has no hardcoded `url` — the connection string comes from `libs/prisma/prisma.config.ts`, which reads `DATABASE_URL` from `libs/prisma/.env`.
- After any schema edit: `yarn nx run prisma:db-push` (dev) then `yarn nx run prisma:generate`.
- Prisma Client generates to `libs/prisma/generated/prisma` — import from there in `api`/`worker`, never regenerate into a different path.
- Only one model exists so far (`Organization`, minimal — just proves the pipe works). The full schema (orgs, users, leads, campaigns, agents, call_logs, seconds_ledger, numbers, notifications) is a later phase — see the design doc.

## Auth

**Zitadel Cloud** (OIDC), not Clerk — the project switched providers early; if you see any reference to Clerk in old notes, it's stale.

- Frontend: `react-oidc-context` + `oidc-client-ts`. Provider setup in `apps/web/src/component/AppOidcProvider.tsx`, wraps the app in `main.tsx`. Callback route handled by `apps/web/src/pages/AuthCallbackPage.tsx` at `/callback`.
- Backend: `libs jose` verifies access tokens against Zitadel's JWKS endpoint directly (no vendor SDK). Guard: `apps/api/src/auth/zitadel-auth.guard.ts`. Attach with `@UseGuards(ZitadelAuthGuard)`, read the verified user with `@CurrentAuth()`.
- Env vars: `VITE_ZITADEL_AUTHORITY`, `VITE_ZITADEL_CLIENT_ID`, `VITE_ZITADEL_REDIRECT_URI` (web); `ZITADEL_ISSUER`, `ZITADEL_AUDIENCE` (api). See each app's `.env.example`.
- Zitadel Cloud free tier: 100 DAU, unlimited orgs/users — sufficient through Phase 0 development.

## Frontend folder convention (`apps/web/src`)

```
pages/           One component per route. Data fetching + business logic for that route lives here.
component/       Reusable components shared across pages (providers, layout, buttons, etc.)
utils/
  types.ts       ALL shared TypeScript types, exported from this one file — do not scatter type files
  helper/        Standalone helper functions only, no React components
```

Each of `pages/`, `component/`, `utils/helper/` has an `index.ts` barrel — import through it (`import { X } from '../pages'`), not by reaching into individual files directly.

## Environment variables

No central `env.yml`/generator tooling — each app/lib has its own plain `.env.example` committed, copy to `.env` locally, never commit `.env` itself.

## Code style (applies everywhere, especially `api` and any Nutritionist Portal work referenced from prior context)

- camelCase, purpose-explaining names (`getFlagSeverityType`, not `data`)
- No ASCII banner comments (`// ─── Section ───`); rely on file structure order (imports → types → constants/helpers → components → export)
- No method chaining across multiple operations — break into named `const` steps
- No nested/inline closures — flatten into named intermediate variables or top-level functions
- No duplicate logic — extract into a shared helper/component
- One blank line after every `const`/`let` declaration
- `/** */` comments; explain non-obvious logic (regex assumptions, ordering dependencies) directly above it
- Prefer antd components over raw HTML wherever an antd equivalent exists
- `type` aliases over `interface`; `PascalCase` + `Type` suffix (`FlagSeverityType`)
- No optional chaining (`?.`) — explicit guard checks instead
- American spelling

## Where the full spec lives

The complete product design doc (architecture, DB schema, phased build plan, Bolna/Razorpay/Vapi evaluation) is tracked outside this repo — ask before assuming details about later phases (bulk calling, campaigns, billing ledger) that aren't reflected in code yet.