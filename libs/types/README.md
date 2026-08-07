# lib-types

This library contains shared TypeScript types and interfaces used across the `web`, `api`, and `worker` applications. Below are the details:

## Folder Structure

This library contains multiple sub-folders eg: `entities`, `dto`, `enums`, `utils`, etc.

| Sub-folder | Description |
| --- | --- |
| entities | Shared domain types mirroring the Prisma schema (Organization, Lead, Campaign, CallLog, Agent, etc.), consumed by both frontend and backend |
| dto | Request/response payload shapes shared between `web` and `api` (e.g. `CreateCampaignPayload`, `CallDispositionResponse`) |
| enums | Shared enums/unions (e.g. `LeadStatus`, `CampaignStatus`, `Disposition`) so both apps stay in sync on allowed values |
| utils | Low-level, framework-agnostic utility functions (formatting, validation helpers) shared across apps |

## Creating a new type file

Manually create a new `.ts` file in the corresponding `libs/types/src/<subFolderName>` directory.

- Replace `<subFolderName>` with the corresponding sub-folder name, e.g. `entities`, `dto`, `enums`.
- Export the new `.ts` file from `libs/types/src/index.ts`.

## Running unit tests

Run `yarn nx run lib-types:test` to execute the unit tests via Vitest.

## Static test - Linting

Run `yarn nx run lib-types:lint` to execute linting
