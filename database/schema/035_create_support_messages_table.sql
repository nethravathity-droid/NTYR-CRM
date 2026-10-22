/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 035_create_support_messages_table.sql
Purpose : Super Admin <-> Company Admin support chat
=========================================================
*/
CREATE TABLE IF NOT EXISTS support_messages (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    -- Sender of the message (super admin or company admin)
    sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(30) NOT NULL, -- PLATFORM_SUPER_ADMIN | COMPANY_ADMIN
    body TEXT NOT NULL,
    is_read_by_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_read_by_company_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_messages_company_id ON support_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_user_id ON support_messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);
