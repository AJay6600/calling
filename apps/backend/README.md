# Infrastructure (`apps/backend`)

Local development infrastructure: **PostgreSQL**, **Hasura GraphQL Engine**, **Redis**, and **pgAdmin** — shared by `api`, `web`, and future workers.

---

## Local development commands

### Start local backend

```bash
yarn nx run backend:start:local
```

Starts PostgreSQL, Hasura, Redis, and pgAdmin.

### Apply Hasura migrations & metadata

After starting (or after a clean DB reset), apply schema and permissions:

```bash
yarn nx run backend:hasura-migrate
yarn nx run backend:hasura-metadata-apply
```

Requires the [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/) installed locally.

### Open Hasura Console

```bash
yarn nx run backend:hasura-console
```

### Check migration status

```bash
yarn nx run backend:hasura-status
```

### Stop local backend

```bash
yarn nx run backend:stop:local
```

### Destroy local backend

Stops containers and removes persistent volumes — use for a clean database:

```bash
yarn nx run backend:destroy:local
```

Then re-run `hasura-migrate` and `hasura-metadata-apply`.

---

## Service endpoints

| Service | URL / Port | Credentials |
|---------|------------|-------------|
| **Hasura Console** | http://localhost:8080/console | Admin secret: `myadminsecretkey` (see `.env`) |
| **Hasura GraphQL API** | http://localhost:8080/v1/graphql | Header: `x-hasura-admin-secret: myadminsecretkey` |
| **Hasura WebSocket** | ws://localhost:8080/v1/graphql | For GraphQL subscriptions |
| **PostgreSQL** | localhost:5432 | User: `postgres`, Password: `postgres`, DB: `postgres` |
| **pgAdmin** | http://localhost:5433 | Email: `admin@aicalling.local`, Password: `postgres` |
| **Redis** | localhost:6379 | — |

---

## Hasura project layout

```
apps/backend/hasura/
  config.yaml                          # CLI config (endpoint, admin secret)
  migrations/default/                  # SQL migrations (source of truth for schema)
  metadata/                            # Tracked tables, permissions, relationships
```

### Adding a new table

1. Create a migration: `hasura migrate create add_my_table --project apps/backend/hasura --database-name default`
2. Edit the generated `up.sql` / `down.sql`
3. Apply: `yarn nx run backend:hasura-migrate`
4. Track the table in Hasura Console or add metadata YAML under `metadata/databases/default/tables/`
5. Apply metadata: `yarn nx run backend:hasura-metadata-apply`

### Squashing migrations

When iterative schema changes result in many migration files, squash them into a single consolidated migration file:

1. Ensure Hasura and Postgres are running (`yarn nx run backend:start:local`).
2. Run the squash command:
   ```bash
   yarn nx run backend:hasura-squash
   ```
   *Alternatively, run Hasura CLI directly specifying starting version:*
   ```bash
   hasura migrate squash --from 1700000000000 --name init_schema --project apps/backend/hasura --database-name default --delete-source
   ```
3. Check migration status to verify DB alignment:
   ```bash
   yarn nx run backend:hasura-status
   ```

---

## Environment variables

Copy values into `apps/backend/.env` (gitignored):

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | Postgres username |
| `POSTGRES_PASSWORD` | `postgres` | Postgres password |
| `POSTGRES_DB` | `postgres` | Database name |
| `POSTGRES_PORT` | `5432` | Host port |
| `HASURA_PORT` | `8080` | Hasura host port |
| `HASURA_GRAPHQL_ADMIN_SECRET` | `myadminsecretkey` | Hasura admin secret |
| `REDIS_PORT` | `6379` | Redis host port |
| `PGADMIN_PORT` | `5433` | pgAdmin host port |
