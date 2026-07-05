/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 008_create_roles_table.sql
Purpose : Create roles table
=========================================================
*/

CREATE TABLE roles (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,

    role_code VARCHAR(30) NOT NULL,

    role_name VARCHAR(100) NOT NULL,

    description TEXT,

    is_system BOOLEAN NOT NULL DEFAULT FALSE,

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_role_uuid UNIQUE (uuid),

    CONSTRAINT uq_company_role UNIQUE (company_id, role_code),

    CONSTRAINT fk_role_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_role_company
ON roles(company_id);

CREATE INDEX idx_role_name
ON roles(role_name);

CREATE INDEX idx_role_status
ON roles(status);