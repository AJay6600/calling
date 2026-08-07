# lib-prisma

This library contains the Prisma schema, generated client, and database access helpers shared between the `api` and `worker` applications. Below are the details:

## Folder Structure

This library contains multiple sub-folders/files eg: `schema`, `client`, `seed`, etc.

| Sub-folder | Description |
| --- | --- |
| schema | Contains `schema.prisma` — the single source of truth for the database schema (organizations, users, leads, campaigns, agents, call_logs, seconds_ledger, numbers, notifications) |
| client | Exports a shared, singleton Prisma Client instance consumed by `api` and `worker` so both apps use the same connection handling |
| seed | Seed scripts for local/staging data — starter `agent_templates`, sample orgs for development |

## Updating the schema

- Edit `libs/prisma/schema/schema.prisma` directly.
- Run `yarn nx run lib-prisma:migrate --name=<migration-name>` to generate and apply a new migration in local development.
- Run `yarn nx run lib-prisma:generate` to regenerate the Prisma Client after any schema change — do this before restarting `api` or `worker`.

## Running unit tests

Run `yarn nx run lib-prisma:test` to execute the unit tests via Vitest.

## Static test - Linting

Run `yarn nx run lib-prisma:lint` to execute linting
