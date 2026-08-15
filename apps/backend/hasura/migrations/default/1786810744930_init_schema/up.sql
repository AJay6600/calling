
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zitadel_org_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE "public"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "zitadel_org_id" varchar NOT NULL, "name" bpchar NOT NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "organization_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"), UNIQUE ("zitadel_org_id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."users" add column "email" bpchar
 not null unique;

alter table "public"."users" add column "password" bpchar
 not null;

alter table "public"."users" rename column "zitadel_org_id" to "zitadel_user_id";

alter table "public"."organizations" add column "bolna_api_key" varchar
 null;

CREATE TABLE "public"."agent_language_enum" ("id" bpchar NOT NULL, "label" bpchar NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"));

INSERT INTO "public"."agent_language_enum"("id", "label") VALUES (E'hindi', E'Hindi');

INSERT INTO "public"."agent_language_enum"("id", "label") VALUES (E'marathi', E'Marathi');

INSERT INTO "public"."agent_language_enum"("id", "label") VALUES (E'english', E'English');

ALTER TABLE "public"."agent_language_enum" ALTER COLUMN "id" TYPE text;

ALTER TABLE "public"."agent_language_enum" ALTER COLUMN "label" TYPE text;
