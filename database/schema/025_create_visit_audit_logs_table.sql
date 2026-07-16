/*
=========================================================
Migration: 025_create_visit_audit_logs_table.sql
Purpose : Visit activity / audit trail
=========================================================
*/

CREATE TABLE IF NOT EXISTS visit_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    performed_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_visit_audit_log_uuid UNIQUE (uuid),
    CONSTRAINT fk_visit_audit_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_audit_visit FOREIGN KEY (visit_id) REFERENCES site_visits(id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_audit_user FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_visit_audit_visit ON visit_audit_logs(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_audit_company ON visit_audit_logs(company_id);
