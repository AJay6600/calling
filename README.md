# AI Calling Platform Monorepo

## Getting started

Run following commands to start using the repo.

```
nvm use
yarn install
```

## Environment variables

Each app/lib manages its own environment variables via a `.env` file, based on the `.env.example` committed in that app/lib's root.

- Copy `.env.example` to `.env` in the app/lib you're working on (e.g. `apps/api/.env.example` -> `apps/api/.env`).
- Fill in the values for your local setup (Postgres connection string, Redis URL, Bolna API key, Razorpay keys, Clerk keys, etc.).
- Never commit `.env` files — only `.env.example` is checked in.

## Apps and Libs

All the apps and libs in this monorepo are documented in [APPS-LIBS.md](./APPS-LIBS.md).

Please refer to it for app/lib specific documentation.
