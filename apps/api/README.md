# api

Backend API for the AI Outbound Calling SaaS Platform. Handles org/auth, leads, campaigns, billing, and Bolna/Razorpay webhooks.

## Local development

### Start server

```
yarn nx run api:serve
```

## Prisma

All Prisma commands run against `apps/api/prisma/schema.prisma`, with the connection URL resolved from `apps/api/prisma.config.ts` (reads `DATABASE_URL`).

| Command | What it does |
|---|---|
| `yarn nx run api:prisma-generate` | Regenerates the Prisma client into `apps/api/generated/prisma` from the current schema. |
| `yarn nx run api:prisma-migrate -- --name <migration_name>` | Creates a new migration from schema changes and applies it to your local dev DB. |
| `yarn nx run api:prisma-deploy` | Applies all pending migrations without generating new ones. Used in CI/staging/production. |
| `yarn nx run api:prisma-seed` | Runs the seed script against the DB. |
| `yarn nx run api:prisma-studio` | Opens Prisma Studio to browse/edit data visually. |
| `yarn nx run api:prisma-reset` | Drops the DB, reapplies all migrations from scratch, and reseeds. **Destructive — local/dev only.** |

## Prisma setup — for a new user on the project

If you've just pulled the repo and need to get Prisma working locally, follow this in order:

1. **Make sure local Postgres is running** (via docker-compose in `apps/backend`) and `DATABASE_URL` is set in `apps/api/.env`.

2. **Generate the Prisma client**
   ```
   yarn nx run api:prisma-generate
   ```
   This reads `apps/api/prisma/schema.prisma` and generates the client into `apps/api/generated/prisma`.

3. **Apply existing migrations to your local DB**
   ```
   yarn nx run api:prisma-migrate
   ```
   This applies all migrations already in `apps/api/prisma/migrations/` to your local Postgres instance, creating the current schema (e.g. `Organization` table).

4. **(Optional) Seed the database**
   ```
   yarn nx run api:prisma-seed
   ```

5. **(Optional) Verify it worked**
   ```
   yarn nx run api:prisma-studio
   ```
   Or connect via pgAdmin at `http://localhost:5433` (see infra README for connection details).

Once this is done, `yarn nx run api:serve` should be able to talk to the DB.

## Updating the Prisma schema

Whenever you change `apps/api/prisma/schema.prisma` (add a model, add a field, change a relation, etc.), follow this flow:

1. **Edit the schema**
   Make your changes in `apps/api/prisma/schema.prisma`.

2. **Create and apply a migration locally**
   ```
   yarn nx run api:prisma-migrate -- --name <describe_the_change>
   ```
   e.g. `--name add_user_table` or `--name add_bolna_agent_id_to_organization`.
   This writes a new folder under `apps/api/prisma/migrations/` and applies it to your local DB.

3. **Regenerate the Prisma client**
   This happens automatically as part of `prisma migrate dev`, but if you ever only pull schema changes without a fresh migration (e.g. after `git pull`), run:
   ```
   yarn nx run api:prisma-generate
   ```

4. **Update any affected code**
   Adjust services, DTOs, or middleware that reference the changed model (e.g. JIT provisioning middleware, `apps/api/src/lib/prisma.ts`).

5. **Commit both the schema and the migration folder**
   Always commit `schema.prisma` together with the newly generated migration folder in `prisma/migrations/` — never edit or delete existing migration files after they've been merged.

6. **On other machines / CI, after pulling the change**
   ```
   yarn nx run api:prisma-deploy
   ```
   This applies the new migration without prompting or generating a fresh one — safe for teammates, CI, and production. Local devs can alternatively run `prisma-migrate` again, which will detect and apply the pending migration.

> ⚠️ If you hit a "migration drift" error (schema doesn't match migration history), do **not** manually edit the DB. Use `yarn nx run api:prisma-reset` locally to drop and rebuild from migrations, or resolve drift explicitly with the team if it's a shared environment.

## Testing

### Linting/Static testing

```
yarn nx run api:lint
```

### Unit/integration Testing

```
yarn nx run api:test
```

### E2E Testing

Refer to README.