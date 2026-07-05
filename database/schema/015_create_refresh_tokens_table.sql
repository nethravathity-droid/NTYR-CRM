/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 015_create_refresh_tokens_table.sql
Purpose : Store refresh tokens for auth session management
=========================================================
*/

CREATE TABLE refresh_tokens (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,

    token_jti VARCHAR(64) NOT NULL,
    token_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    replaced_by_token_jti VARCHAR(64),

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_refresh_token_uuid UNIQUE (uuid),
    CONSTRAINT uq_refresh_token_jti UNIQUE (token_jti),

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_token_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user
ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_company
ON refresh_tokens(company_id);

CREATE INDEX idx_refresh_tokens_expires
ON refresh_tokens(expires_at);

CREATE INDEX idx_refresh_tokens_active
ON refresh_tokens(user_id, revoked_at)
WHERE revoked_at IS NULL;
