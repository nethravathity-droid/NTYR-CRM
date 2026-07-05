/*
=========================================================
Project : Real Estate CRM SaaS
Migration: 017_create_lead_audit_logs_table.sql
Purpose : Lead audit trail
=========================================================
*/

CREATE TABLE lead_audit_logs (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,
    lead_id BIGINT NOT NULL,

    action VARCHAR(50) NOT NULL,
    changes JSONB,

    performed_by BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lead_audit_log_uuid
        UNIQUE(uuid),

    CONSTRAINT fk_lead_audit_company
        FOREIGN KEY(company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_lead_audit_lead
        FOREIGN KEY(lead_id)
        REFERENCES leads(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX idx_lead_audit_company
ON lead_audit_logs(company_id);

CREATE INDEX idx_lead_audit_lead
ON lead_audit_logs(lead_id);

CREATE INDEX idx_lead_audit_created_at
ON lead_audit_logs(created_at);
