ALTER TABLE public.call_logs DROP COLUMN IF EXISTS campaign_id;
DROP TABLE IF EXISTS public.campaign_leads;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.campaign_status_enum;
