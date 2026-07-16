/*
=========================================================
Migration: 031_create_calls_table.sql
Purpose : Create call logs table
=========================================================
*/

CREATE TABLE IF NOT EXISTS calls (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    call_number VARCHAR(30) NOT NULL,
    lead_id BIGINT,
    customer_name VARCHAR(200) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    call_status VARCHAR(30) NOT NULL,
    call_date DATE NOT NULL,
    call_time TIME NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    assigned_user_id BIGINT,
    notes TEXT,
    followup_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_call_uuid UNIQUE (uuid),
    CONSTRAINT uq_call_number_company UNIQUE (company_id, call_number),
    CONSTRAINT fk_call_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_call_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_followup FOREIGN KEY (followup_id) REFERENCES followups(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_call_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_call_direction CHECK (direction IN ('INCOMING', 'OUTGOING', 'MISSED')),
    CONSTRAINT chk_call_status CHECK (call_status IN ('ANSWERED', 'BUSY', 'NO_ANSWER', 'SWITCHED_OFF', 'WRONG_NUMBER')),
    CONSTRAINT chk_call_duration CHECK (duration_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS idx_calls_company_date ON calls(company_id, call_date, direction);
CREATE INDEX IF NOT EXISTS idx_calls_company_deleted ON calls(company_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_calls_lead ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_assigned_user ON calls(assigned_user_id);
