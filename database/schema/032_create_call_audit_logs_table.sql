/*
=========================================================
Migration: 032_create_call_audit_logs_table.sql
Purpose : Create call audit logs table
=========================================================
*/

CREATE TABLE IF NOT EXISTS call_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    call_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    performed_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_call_audit_uuid UNIQUE (uuid),
    CONSTRAINT fk_call_audit_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_call_audit_call FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    CONSTRAINT fk_call_audit_performed_by FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_call_audit_call ON call_audit_logs(call_id, created_at DESC);
