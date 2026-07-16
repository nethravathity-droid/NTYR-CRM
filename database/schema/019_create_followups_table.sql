/*
=========================================================
Migration: 019_create_followups_table.sql
Purpose : Create followups table
=========================================================
*/

CREATE TABLE IF NOT EXISTS followups (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    lead_id BIGINT,
    customer_name VARCHAR(200) NOT NULL,
    assigned_user_id BIGINT,
    followup_date DATE NOT NULL,
    followup_time TIME NOT NULL,
    followup_type VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    reminder_before INTEGER NOT NULL DEFAULT 30,
    next_followup_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_followup_uuid UNIQUE (uuid),
    CONSTRAINT fk_followup_company
        FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_followup_lead
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    CONSTRAINT fk_followup_assigned_user
        FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_followup_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_followup_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_followup_deleted_by
        FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_followup_type
        CHECK (followup_type IN ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'SITE_VISIT')),
    CONSTRAINT chk_followup_priority
        CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_followup_status
        CHECK (status IN ('PENDING', 'COMPLETED', 'MISSED', 'RESCHEDULED')),
    CONSTRAINT chk_followup_reminder_before
        CHECK (reminder_before IN (5, 15, 30, 60))
);

CREATE INDEX IF NOT EXISTS idx_followups_company_date_status
    ON followups(company_id, followup_date, status);

CREATE INDEX IF NOT EXISTS idx_followups_company_deleted
    ON followups(company_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_followups_lead
    ON followups(lead_id);
