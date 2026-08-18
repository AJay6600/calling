-- Create Lead Status Enum Table
CREATE TABLE IF NOT EXISTS public.lead_status_enum (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);

-- Seed Lead Statuses
INSERT INTO public.lead_status_enum (id, label) VALUES
    ('new', 'New'),
    ('contacting', 'In Progress'),
    ('qualified', 'Qualified'),
    ('callback_requested', 'Callback Requested'),
    ('not_interested', 'Not Interested'),
    ('unreachable', 'Unreachable'),
    ('do_not_call', 'Do Not Call'),
    ('converted', 'Converted')
ON CONFLICT (id) DO NOTHING;

-- Create Main Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Multi-Tenant Context
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    zitadel_org_id VARCHAR(255) NOT NULL,
    
    -- Contact Details
    name VARCHAR(255) NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NULL,
    company_name VARCHAR(255) NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'new' REFERENCES public.lead_status_enum(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- Aggregated Call Insights
    total_calls_count INT NOT NULL DEFAULT 0,
    last_call_at TIMESTAMPTZ NULL,
    last_disposition_id TEXT NULL REFERENCES public.disposition_enum(id) ON UPDATE CASCADE ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT uq_leads_org_phone UNIQUE (organization_id, phone_number)
);

-- Add lead_id foreign key column to call_logs table
ALTER TABLE public.call_logs
    ADD COLUMN IF NOT EXISTS lead_id UUID NULL REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Database Indexes for Leads
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_zitadel_org_id ON public.leads(zitadel_org_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone_number ON public.leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON public.call_logs(lead_id);
