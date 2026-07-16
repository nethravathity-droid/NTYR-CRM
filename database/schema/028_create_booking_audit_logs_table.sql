/*
=========================================================
Migration: 028_create_booking_audit_logs_table.sql
Purpose : Audit trail for booking lifecycle events
=========================================================
*/

CREATE TABLE IF NOT EXISTS booking_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    performed_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_booking_audit_uuid UNIQUE (uuid),
    CONSTRAINT fk_booking_audit_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_booking_audit_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_audit_performed_by FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_audit_booking ON booking_audit_logs(booking_id, created_at DESC);
