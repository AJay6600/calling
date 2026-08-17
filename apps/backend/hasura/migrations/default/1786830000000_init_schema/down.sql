
ALTER TABLE public.call_logs DROP CONSTRAINT IF EXISTS fk_call_logs_status;
DROP TABLE IF EXISTS public.call_status_enum;

ALTER TABLE public.call_logs DROP CONSTRAINT IF EXISTS fk_call_logs_disposition;
DROP TABLE IF EXISTS public.disposition_enum;

DROP TABLE IF EXISTS public.call_logs;

DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.agent_language_enum CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
