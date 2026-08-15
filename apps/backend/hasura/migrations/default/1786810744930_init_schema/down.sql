
ALTER TABLE "public"."agent_language_enum" ALTER COLUMN "label" TYPE character;

ALTER TABLE "public"."agent_language_enum" ALTER COLUMN "id" TYPE character;

DELETE FROM "public"."agent_language_enum" WHERE "id" = 'english';

DELETE FROM "public"."agent_language_enum" WHERE "id" = 'marathi';

DELETE FROM "public"."agent_language_enum" WHERE "id" = 'hindi';

DROP TABLE "public"."agent_language_enum";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."organizations" add column "bolna_api_key" varchar
--  null;

alter table "public"."users" rename column "zitadel_user_id" to "zitadel_org_id";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."users" add column "password" bpchar
--  not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."users" add column "email" bpchar
--  not null unique;

DROP TABLE "public"."users";

-- Intentionally empty — users, campaigns, and leads were removed from the schema.

DROP TABLE IF EXISTS public.organizations CASCADE;
