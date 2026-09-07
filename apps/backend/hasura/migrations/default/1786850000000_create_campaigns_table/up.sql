-- Create Campaign Status Enum Table
CREATE TABLE IF NOT EXISTS public.campaign_status_enum (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);

-- Seed Campaign Statuses
INSERT INTO public.campaign_status_enum (id, label) VALUES
    ('draft', 'Draft'),
    ('scheduled', 'Scheduled'),
    ('running', 'Running'),
    ('completed', 'Completed'),
    ('stopped', 'Stopped')
ON CONFLICT (id) DO NOTHING;

-- Create Main Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Multi-Tenant Context
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    zitadel_org_id VARCHAR(255) NOT NULL,
    
    -- Campaign Properties
    name VARCHAR(255) NOT NULL,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' REFERENCES public.campaign_status_enum(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    lead_source_type VARCHAR(50) NOT NULL DEFAULT 'csv',
    
    -- Auto-Retry Configuration
    auto_retry_enabled BOOLEAN NOT NULL DEFAULT false,
    auto_retry_conditions JSONB NULL,
    auto_retry_max_attempts INT NOT NULL DEFAULT 1,
    auto_retry_gap_minutes INT NOT NULL DEFAULT 15,
    
    -- Calling Window Configuration
    calling_window_start VARCHAR(10) NULL,
    calling_window_end VARCHAR(10) NULL,
    calling_window_timezone VARCHAR(100) NULL,
    
    -- Execution Timestamps
    scheduled_at TIMESTAMPTZ NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    stopped_at TIMESTAMPTZ NULL,
    
    -- Record Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT uq_campaigns_org_name UNIQUE (organization_id, name)
);

-- Create Campaign Leads Junction Table
CREATE TABLE IF NOT EXISTS public.campaign_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE,
    variables JSONB NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    attempts_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_campaign_leads UNIQUE (campaign_id, lead_id)
);

-- Add campaign_id column to call_logs table
ALTER TABLE public.call_logs
    ADD COLUMN IF NOT EXISTS campaign_id UUID NULL REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Database Indexes for Campaigns & Campaign Leads
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON public.campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_zitadel_org_id ON public.campaigns(zitadel_org_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_agent_id ON public.campaigns(agent_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON public.campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead_id ON public.campaign_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_campaign_id ON public.call_logs(campaign_id);
