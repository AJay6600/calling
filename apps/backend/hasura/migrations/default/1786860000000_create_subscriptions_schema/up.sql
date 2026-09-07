-- Subscription Packages
CREATE TABLE IF NOT EXISTS public.subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    allocated_seconds INT NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    validity_days INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Packages
INSERT INTO public.subscription_packages (id, name, description, allocated_seconds, price_usd, validity_days) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Free Trial', 'Trial package with 100 free call minutes', 6000, 0.00, 30),
    ('22222222-2222-2222-2222-222222222222', 'Starter Plan', 'Essential calling package with 600 call minutes', 36000, 29.00, 30),
    ('33333333-3333-3333-3333-333333333333', 'Growth Plan', 'High-volume calling package with 3,000 call minutes', 180000, 119.00, 30),
    ('44444444-4444-4444-4444-444444444444', 'Enterprise Plan', 'Unlimited scale calling package with 15,000 call minutes', 900000, 499.00, 30)
ON CONFLICT (id) DO NOTHING;

-- Organization Subscriptions
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    package_id UUID NULL REFERENCES public.subscription_packages(id) ON UPDATE CASCADE ON DELETE SET NULL,
    allocated_seconds INT NOT NULL DEFAULT 0,
    remaining_seconds INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Usage Logs (Deduction & Credit History)
CREATE TABLE IF NOT EXISTS public.subscription_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_subscription_id UUID NOT NULL REFERENCES public.organization_subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    call_log_id UUID NULL REFERENCES public.call_logs(id) ON UPDATE CASCADE ON DELETE SET NULL,
    seconds_deducted INT NOT NULL DEFAULT 0,
    balance_after INT NOT NULL DEFAULT 0,
    description TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Lookup
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org_id ON public.organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON public.organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_org_id ON public.subscription_usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_sub_id ON public.subscription_usage_logs(organization_subscription_id);

-- Automatically Seed Initial Active Subscriptions for Existing Organizations (6,000 seconds = 100 free mins)
INSERT INTO public.organization_subscriptions (organization_id, package_id, allocated_seconds, remaining_seconds, status, start_date, end_date)
SELECT 
    id AS organization_id,
    '11111111-1111-1111-1111-111111111111'::uuid AS package_id,
    6000 AS allocated_seconds,
    6000 AS remaining_seconds,
    'active' AS status,
    NOW() AS start_date,
    (NOW() + INTERVAL '30 days') AS end_date
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.organization_subscriptions)
ON CONFLICT DO NOTHING;
