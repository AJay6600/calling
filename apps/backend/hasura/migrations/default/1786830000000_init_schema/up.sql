
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zitadel_org_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    bolna_api_key VARCHAR(255) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zitadel_user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Language Enum
CREATE TABLE IF NOT EXISTS public.agent_language_enum (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);

INSERT INTO public.agent_language_enum (id, label) VALUES
    ('english', 'English'),
    ('hindi', 'Hindi'),
    ('marathi', 'Marathi')
ON CONFLICT (id) DO NOTHING;

-- Agents Table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    zitadel_org_id VARCHAR(255) NOT NULL,
    bolna_agent_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    language_id TEXT REFERENCES public.agent_language_enum(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Call Logs Table
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Multi-Tenant & Organization Context
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    zitadel_org_id VARCHAR(255) NOT NULL,
    
    -- Agent Identifiers
    agent_id UUID NULL REFERENCES public.agents(id) ON UPDATE CASCADE ON DELETE SET NULL,
    bolna_agent_id VARCHAR(255) NOT NULL,
    bolna_execution_id VARCHAR(255) UNIQUE NOT NULL,

    -- Call Target & Telephony Details
    recipient_phone_number VARCHAR(50) NOT NULL,
    agent_phone_number VARCHAR(50) NULL,
    call_type VARCHAR(20) DEFAULT 'outbound',
    telephony_provider VARCHAR(50) NULL,

    -- Real-Time Status & Termination Reasons
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    hangup_by VARCHAR(50) NULL,
    hangup_reason VARCHAR(255) NULL,

    -- Metrics & Audio
    duration_seconds INT DEFAULT 0,
    recording_url TEXT NULL,
    total_cost NUMERIC(10, 4) DEFAULT 0.0000,

    -- Post-Call AI Intelligence & Extractions
    disposition VARCHAR(255) NULL,
    summary TEXT NULL,
    transcript TEXT NULL,
    extracted_data JSONB NULL,
    latency_data JSONB NULL,
    
    -- Full Raw Webhook Payload Backup
    raw_response JSONB NULL,

    -- Timestamps
    initiated_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Database Indexes for Performance & Multi-Tenant Queries
CREATE INDEX IF NOT EXISTS idx_call_logs_org_id ON public.call_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_zitadel_org_id ON public.call_logs(zitadel_org_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_agent_id ON public.call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON public.call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON public.call_logs(created_at DESC);

-- Drop old disposition_enum table if it was created with 3 columns
ALTER TABLE public.call_logs DROP CONSTRAINT IF EXISTS fk_call_logs_disposition;
DROP TABLE IF EXISTS public.disposition_enum;

-- Create Disposition Enum Table with exactly 2 columns for Hasura enum support
CREATE TABLE IF NOT EXISTS public.disposition_enum (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);

-- Insert predefined dispositions
INSERT INTO public.disposition_enum (id, label) VALUES
    ('interested', 'Interested'),
    ('not_interested', 'Not Interested'),
    ('callback_requested', 'Callback Requested'),
    ('voicemail', 'Voicemail'),
    ('no_answer', 'No Answer'),
    ('do_not_call', 'Do Not Call')
ON CONFLICT (id) DO NOTHING;

-- Normalize existing values in call_logs table before applying FK
UPDATE public.call_logs
SET disposition = CASE
    WHEN LOWER(TRIM(disposition)) = 'interested' THEN 'interested'
    WHEN LOWER(TRIM(disposition)) IN ('not interested', 'not_interested') THEN 'not_interested'
    WHEN LOWER(TRIM(disposition)) IN ('callback requested', 'callback_requested', 'callback') THEN 'callback_requested'
    WHEN LOWER(TRIM(disposition)) = 'voicemail' THEN 'voicemail'
    WHEN LOWER(TRIM(disposition)) IN ('no answer', 'no_answer') THEN 'no_answer'
    WHEN LOWER(TRIM(disposition)) IN ('do not call', 'do_not_call') THEN 'do_not_call'
    ELSE NULL
END
WHERE disposition IS NOT NULL;

-- Add Foreign Key constraint to call_logs table
ALTER TABLE public.call_logs
    ADD CONSTRAINT fk_call_logs_disposition
    FOREIGN KEY (disposition)
    REFERENCES public.disposition_enum(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- Create Call Status Enum Table
CREATE TABLE IF NOT EXISTS public.call_status_enum (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);

-- Insert Bolna call statuses
INSERT INTO public.call_status_enum (id, label) VALUES
    ('queued', 'Queued'),
    ('initiated', 'Initiated'),
    ('ringing', 'Ringing'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ('busy', 'Busy'),
    ('no_answer', 'No Answer'),
    ('cancelled', 'Cancelled'),
    ('call_disconnected', 'Disconnected'),
    ('scheduled', 'Scheduled'),
    ('rescheduled', 'Rescheduled'),
    ('stopped', 'Stopped'),
    ('balance_low', 'Balance Low'),
    ('error', 'Error')
ON CONFLICT (id) DO NOTHING;

-- Normalize existing status values in call_logs table before adding FK
UPDATE public.call_logs
SET status = CASE
    WHEN LOWER(TRIM(status)) IN ('in-progress', 'in_progress') THEN 'in_progress'
    WHEN LOWER(TRIM(status)) IN ('canceled', 'cancelled') THEN 'cancelled'
    WHEN LOWER(TRIM(status)) IN ('no-answer', 'no_answer') THEN 'no_answer'
    WHEN LOWER(TRIM(status)) IN ('call-disconnected', 'call_disconnected') THEN 'call_disconnected'
    WHEN LOWER(TRIM(status)) IN ('balance-low', 'balance_low') THEN 'balance_low'
    WHEN LOWER(TRIM(status)) = 'queued' THEN 'queued'
    WHEN LOWER(TRIM(status)) = 'initiated' THEN 'initiated'
    WHEN LOWER(TRIM(status)) = 'ringing' THEN 'ringing'
    WHEN LOWER(TRIM(status)) = 'completed' THEN 'completed'
    WHEN LOWER(TRIM(status)) = 'failed' THEN 'failed'
    WHEN LOWER(TRIM(status)) = 'busy' THEN 'busy'
    WHEN LOWER(TRIM(status)) = 'scheduled' THEN 'scheduled'
    WHEN LOWER(TRIM(status)) = 'rescheduled' THEN 'rescheduled'
    WHEN LOWER(TRIM(status)) = 'stopped' THEN 'stopped'
    WHEN LOWER(TRIM(status)) = 'error' THEN 'error'
    ELSE 'queued'
END
WHERE status IS NOT NULL;

-- Set default status on call_logs table
ALTER TABLE public.call_logs ALTER COLUMN status SET DEFAULT 'queued';

-- Add Foreign Key constraint to call_logs table
ALTER TABLE public.call_logs
    DROP CONSTRAINT IF EXISTS fk_call_logs_status,
    ADD CONSTRAINT fk_call_logs_status
    FOREIGN KEY (status)
    REFERENCES public.call_status_enum(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
