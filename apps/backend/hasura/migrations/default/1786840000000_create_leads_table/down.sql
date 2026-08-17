ALTER TABLE public.call_logs DROP COLUMN IF EXISTS lead_id;
DROP TABLE IF EXISTS public.leads;
DROP TABLE IF EXISTS public.lead_status_enum;
