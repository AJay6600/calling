# Backend API (`apps/api`)

Express REST API and Apollo Server GraphQL for the AI Outbound Calling platform. Handles Zitadel JWT verification, organization JIT provisioning via Hasura, Bolna call triggers, and custom GraphQL mutations.

---

## Quick start

### 1. Start infrastructure & apply migrations

```bash
yarn nx run backend:start:local
yarn nx run backend:hasura-migrate
yarn nx run backend:hasura-metadata-apply
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
# Fill in Zitadel, Hasura, and Bolna credentials
```

### 3. Start the API

```bash
yarn nx run api:serve
```

| Endpoint | URL |
|----------|-----|
| REST API | http://localhost:3000/api |
| Apollo GraphQL | http://localhost:3000/graphql |
| Health check | Query `{ graphqlHealth { status } }` on `/graphql` |

---

## Architecture

- **REST routes** (`/api/*`) — existing call trigger, auth bootstrap, `/me`
- **Apollo Server** (`/graphql`) — custom mutations like `triggerOutboundCall`, `syncAgentConfig`
- **Hasura admin client** (`src/lib/hasuraClient.ts`) — server-side GraphQL for org upsert in middleware

Data reads/writes from the web app go directly to **Hasura** via Apollo Client. The API uses Hasura only for privileged server-side operations (org provisioning).

---

## Hasura integration

The API talks to Hasura using the admin secret (never expose this to the browser):

```typescript
import { queryHasuraAdmin } from './lib/hasuraClient';

const data = await queryHasuraAdmin(`
  query GetOrganization($zitadel_org_id: String!) {
    organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }) {
      id
      name
    }
  }
`, { zitadel_org_id: orgId });
```

Environment variables:

| Variable | Description |
|----------|-------------|
| `HASURA_GRAPHQL_ENDPOINT` | Default: `http://localhost:8080/v1/graphql` |
| `HASURA_GRAPHQL_ADMIN_SECRET` | Must match `apps/backend/.env` |

---

## GraphQL schema (Apollo Server)

Custom schema at `/graphql` (authenticated via Zitadel JWT):

**Queries:** `graphqlHealth`, `me`

**Mutations:** `triggerOutboundCall`, `syncAgentConfig`

REST `POST /api/calls` and GraphQL `triggerOutboundCall` both invoke Bolna.

---

## Testing & linting

```bash
yarn nx run api:lint
yarn nx run api:test
```
