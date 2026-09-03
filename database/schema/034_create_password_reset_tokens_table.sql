CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_prt_user
        FOREIGN KEY(user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_prt_company
        FOREIGN KEY(company_id) REFERENCES companies(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_tokens_user
ON password_reset_tokens(user_id);

CREATE INDEX idx_password_reset_tokens_token
ON password_reset_tokens(token_hash);
