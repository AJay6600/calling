# AI Calling Platform Monorepo

Multi-tenant SaaS for AI outbound calling — organizations upload leads, run campaigns, and trigger voice calls via Bolna. Data is stored in **PostgreSQL**, exposed through **Hasura GraphQL Engine**, with **Apollo Server** on the API for custom mutations and **Apollo Client** on the web.

## Getting started

```bash
nvm use
yarn install
```

Copy each app's `.env.example` to `.env` and fill in values before running.

## Architecture

```
apps/web (React + Apollo Client)
    ├── Hasura GraphQL  →  PostgreSQL  (queries, mutations, subscriptions)
    └── Express REST API  →  Bolna, auth bootstrap

apps/api (Express + Apollo Server)
    ├── /graphql  →  custom mutations (calls, agent sync)
    ├── /api/*    →  REST routes (calls, auth, /me)
    └── Hasura admin client  →  org JIT provisioning

apps/backend (Docker Compose)
    ├── PostgreSQL
    ├── Hasura GraphQL Engine
    ├── Redis
    └── pgAdmin
```

## Local development

### 1. Start infrastructure

```bash
yarn nx run backend:start:local
```

This starts Postgres (`5432`), Hasura (`8080`), Redis (`6379`), and pgAdmin (`5433`).

### 2. Apply database schema (Hasura migrations)

Install the [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/) if you don't have it, then:

```bash
yarn nx run backend:hasura-migrate
yarn nx run backend:hasura-metadata-apply
```

Schema SQL lives in `apps/backend/hasura/migrations/`. Table permissions and tracking live in `apps/backend/hasura/metadata/`.

### 3. Run apps

```bash
yarn nx run api:serve    # REST :3000/api, GraphQL :3000/graphql
yarn nx run web:serve    # Dashboard :4200
```

### 4. Useful Hasura commands

```bash
yarn nx run backend:hasura-console   # open Hasura Console (http://localhost:8080/console)
yarn nx run backend:hasura-status    # check migration status
yarn nx run backend:stop:local       # stop containers
yarn nx run backend:destroy:local    # stop + wipe volumes (clean DB)
```

## GraphQL Code Generation

Whenever you add or modify GraphQL queries/mutations in `apps/web/src/graphql/`:

1. **Write your GraphQL query/mutation** in `apps/web/src/graphql/queries/` or `apps/web/src/graphql/mutations/` (e.g., using `gql` tagged template literals).
2. **Ensure Hasura is running** (`yarn nx run backend:start:local`).
3. **Generate TypeScript types & Apollo hooks**:
   ```bash
   yarn nx run web:codegen
   ```
   *Or run watch mode during active development to auto-generate on save:*
   ```bash
   yarn nx run web:codegen-watch
   ```
4. **Use in components**: Import the generated hooks or types directly from `apps/web/src/graphql`:
   ```tsx
   import { useGetOrganizationWithUserQuery } from '../graphql';

   const { data, loading, error } = useGetOrganizationWithUserQuery({
     variables: { zitadel_org_id, zitadel_user_id },
   });
   ```

## Environment variables

Each app manages its own `.env` from `.env.example`. Never commit `.env` files.

| App | Key variables |
|-----|---------------|
| `apps/backend` | `POSTGRES_*`, `HASURA_GRAPHQL_ADMIN_SECRET`, `HASURA_PORT` |
| `apps/api` | `ZITADEL_ISSUER`, `ZITADEL_AUDIENCE`, `HASURA_GRAPHQL_ENDPOINT`, `HASURA_GRAPHQL_ADMIN_SECRET`, `BOLNA_*` |
| `apps/web` | `VITE_ZITADEL_*`, `VITE_API_BASE_URL`, `VITE_HASURA_GRAPHQL_URL`, `VITE_HASURA_WS_URL` |

## Apps and libs

| Path | Description |
|------|-------------|
| `apps/web` | React 19 dashboard — Apollo Client → Hasura, REST → API |
| `apps/api` | Express REST + Apollo Server GraphQL |
| `apps/backend` | Docker infra + Hasura project (`hasura/migrations`, `hasura/metadata`) |
| `apps/api-e2e` | API end-to-end tests |
| `libs/types` | Shared TypeScript types |

## Auth

**Zitadel Cloud** (OIDC) — not Clerk. Web uses `react-oidc-context`; API verifies JWTs via `jose` + JWKS. Hasura is configured with an `anonymous` role for local dev; production should add JWT mode with Zitadel claims for row-level security.

## Database

- **ORM:** Hasura (Prisma removed)
- **Migrations:** `apps/backend/hasura/migrations/` via Hasura CLI
- **Tables:** `organizations`
- **Console:** http://localhost:8080/console (admin secret in `apps/backend/.env`)

See `apps/backend/README.md` and `apps/api/README.md` for service-specific docs.
