# Web Dashboard (`apps/web`)

Organization-facing React dashboard for the AI Outbound Calling SaaS platform — leads, campaigns, calls, analytics, and billing.

## Data layer

- **Hasura GraphQL** via Apollo Client — queries, mutations, and subscriptions (`src/lib/apolloClient.ts`, `src/graphql/queries.ts`)
- **Express REST API** via Axios — auth bootstrap, single call trigger (`src/utils/helper/apiClient.ts`)

Both clients attach the Zitadel OIDC token automatically after login.

## Local development

```bash
cp apps/web/.env.example apps/web/.env
yarn nx run web:serve
```

Dashboard: http://localhost:4200

Ensure Hasura is running and migrations are applied (see root `README.md`).

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_ZITADEL_AUTHORITY` | Zitadel issuer URL |
| `VITE_ZITADEL_CLIENT_ID` | OIDC client ID |
| `VITE_ZITADEL_REDIRECT_URI` | Callback URL (default port 4200) |
| `VITE_API_BASE_URL` | Express API base URL |
| `VITE_HASURA_GRAPHQL_URL` | Hasura HTTP endpoint |
| `VITE_HASURA_WS_URL` | Hasura WebSocket endpoint |

## Testing

```bash
yarn nx run web:lint
yarn nx run web:test
```
