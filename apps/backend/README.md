# backend

Local development infrastructure (Postgres, Redis, pgAdmin) shared by `api` and `worker`. This project only holds Docker Compose config — no application code.

## Local development

### Start local backend

```
yarn nx run backend:start:local
```

### Stop local backend

```
yarn nx run backend:stop:local
```

### Destroy local backend

Stops containers and removes volumes — use this when you want a clean database.

```
yarn nx run backend:destroy:local
```

## View data in pgAdmin

### Access pgAdmin

You can now access pgAdmin at http://localhost:5433 — use your credentials.

### Connect to PostgreSQL

To connect to PostgreSQL, create a new server with the following settings:

```
Host=postgres
Port=5432
Username=postgres
Password=postgres
Database=postgres
```

Refer to `/apps/backend/.env` for values of the above settings.

## Connecting from api / worker

`api` and `worker` connect to this same Postgres/Redis from the host machine (outside Docker), so their `DATABASE_URL`/`REDIS_URL` use `localhost`, not `postgres`/`redis` — those hostnames only resolve inside the Docker network (e.g. from pgAdmin, above).
