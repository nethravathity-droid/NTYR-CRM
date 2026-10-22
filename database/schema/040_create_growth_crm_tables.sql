/*
=========================================================
Migration: 040_create_growth_crm_tables.sql
Purpose : Marketing, automation, forms, funnels (GHL/Zoho-style)
=========================================================
*/

CREATE TABLE IF NOT EXISTS message_templates (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_message_template_uuid UNIQUE (uuid),
    CONSTRAINT chk_message_template_channel CHECK (channel IN ('EMAIL', 'SMS', 'WHATSAPP')),
    CONSTRAINT chk_message_template_status CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS idx_message_templates_company ON message_templates(company_id, deleted_at);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    template_id BIGINT REFERENCES message_templates(id) ON DELETE SET NULL,
    audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    scheduled_at TIMESTAMPTZ,
    sent_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_marketing_campaign_uuid UNIQUE (uuid),
    CONSTRAINT chk_marketing_campaign_channel CHECK (channel IN ('EMAIL', 'SMS', 'WHATSAPP')),
    CONSTRAINT chk_marketing_campaign_status CHECK (status IN ('DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_company ON marketing_campaigns(company_id, status);

CREATE TABLE IF NOT EXISTS automation_workflows (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(40) NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    run_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_automation_workflow_uuid UNIQUE (uuid),
    CONSTRAINT chk_automation_workflow_status CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS idx_automation_workflows_company ON automation_workflows(company_id, status);

CREATE TABLE IF NOT EXISTS web_forms (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    submission_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_web_form_uuid UNIQUE (uuid),
    CONSTRAINT uq_web_form_company_slug UNIQUE (company_id, slug),
    CONSTRAINT chk_web_form_status CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS idx_web_forms_company ON web_forms(company_id, deleted_at);

CREATE TABLE IF NOT EXISTS web_form_submissions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    form_id BIGINT NOT NULL REFERENCES web_forms(id) ON DELETE CASCADE,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_web_form_submission_uuid UNIQUE (uuid)
);

CREATE INDEX IF NOT EXISTS idx_web_form_submissions_form ON web_form_submissions(form_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sales_funnels (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_sales_funnel_uuid UNIQUE (uuid),
    CONSTRAINT chk_sales_funnel_status CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE TABLE IF NOT EXISTS scheduled_appointments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    location TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_scheduled_appointment_uuid UNIQUE (uuid),
    CONSTRAINT chk_scheduled_appointment_status CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);

CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_company_start ON scheduled_appointments(company_id, start_at);

CREATE TABLE IF NOT EXISTS reputation_reviews (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(200) NOT NULL,
    reviewer_email VARCHAR(200),
    rating SMALLINT NOT NULL,
    review_text TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_reputation_review_uuid UNIQUE (uuid),
    CONSTRAINT chk_reputation_review_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_reputation_review_status CHECK (status IN ('PUBLISHED', 'HIDDEN', 'PENDING'))
);

CREATE TABLE IF NOT EXISTS outreach_messages (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    campaign_id BIGINT REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(200) NOT NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_outreach_message_uuid UNIQUE (uuid),
    CONSTRAINT chk_outreach_message_channel CHECK (channel IN ('EMAIL', 'SMS', 'WHATSAPP'))
);

CREATE INDEX IF NOT EXISTS idx_outreach_messages_company ON outreach_messages(company_id, created_at DESC);
