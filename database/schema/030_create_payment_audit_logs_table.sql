/*
=========================================================
Migration: 030_create_payment_audit_logs_table.sql
Purpose : Audit trail for payment lifecycle events
=========================================================
*/

CREATE TABLE IF NOT EXISTS payment_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    payment_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    performed_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_payment_audit_uuid UNIQUE (uuid),
    CONSTRAINT fk_payment_audit_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_payment_audit_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_audit_performed_by FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_payment ON payment_audit_logs(payment_id, created_at DESC);
