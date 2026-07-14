/*
=========================================================
Migration: 018_create_leads_table.sql
Purpose : Create leads table
=========================================================
*/

CREATE TABLE IF NOT EXISTS leads (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,
    assigned_to BIGINT,

    lead_number VARCHAR(50) NOT NULL UNIQUE,

    customer_name VARCHAR(200) NOT NULL,

    mobile VARCHAR(20) NOT NULL,
    alternate_mobile VARCHAR(20),

    email VARCHAR(255),

    city VARCHAR(100),

    project_interested VARCHAR(200),

    property_type VARCHAR(100),

    budget NUMERIC(15,2),

    lead_source VARCHAR(100),

    priority VARCHAR(20) DEFAULT 'WARM',

    status VARCHAR(50) DEFAULT 'NEW',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_lead_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id),

    CONSTRAINT fk_lead_assigned_user
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_leads_company
ON leads(company_id);

CREATE INDEX IF NOT EXISTS idx_leads_mobile
ON leads(mobile);

CREATE INDEX IF NOT EXISTS idx_leads_status
ON leads(status);

CREATE INDEX IF NOT EXISTS idx_leads_assigned
ON leads(assigned_to);