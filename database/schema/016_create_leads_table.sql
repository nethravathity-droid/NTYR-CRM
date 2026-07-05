/*
=========================================================
Project : Real Estate CRM SaaS
Migration: 016_create_leads_table.sql
Purpose : Create leads table
=========================================================
*/

CREATE TABLE leads (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,

    lead_number VARCHAR(30) NOT NULL,

    customer_name VARCHAR(200) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    alternate_mobile VARCHAR(20),
    email CITEXT,

    project_interested VARCHAR(200),
    budget NUMERIC(15, 2),
    property_type VARCHAR(100),
    lead_source VARCHAR(100),
    campaign VARCHAR(150),
    city VARCHAR(100),

    assigned_user_id BIGINT,

    priority lead_priority NOT NULL DEFAULT 'MEDIUM',
    status lead_status NOT NULL DEFAULT 'NEW',
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_lead_uuid
        UNIQUE(uuid),

    CONSTRAINT uq_company_lead_number
        UNIQUE(company_id, lead_number),

    CONSTRAINT fk_lead_company
        FOREIGN KEY(company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_lead_assigned_user
        FOREIGN KEY(assigned_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE INDEX idx_leads_company
ON leads(company_id);

CREATE INDEX idx_leads_mobile
ON leads(mobile);

CREATE INDEX idx_leads_email
ON leads(email);

CREATE INDEX idx_leads_status
ON leads(status);

CREATE INDEX idx_leads_priority
ON leads(priority);

CREATE INDEX idx_leads_assigned_user
ON leads(assigned_user_id);

CREATE INDEX idx_leads_lead_number
ON leads(lead_number);

CREATE INDEX idx_leads_created_at
ON leads(created_at);

CREATE INDEX idx_leads_deleted_at
ON leads(deleted_at);
