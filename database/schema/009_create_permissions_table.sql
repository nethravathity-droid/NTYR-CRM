/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 009_create_permissions_table.sql
Purpose : Create permissions table
=========================================================
*/

CREATE TABLE permissions (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    permission_code VARCHAR(100) NOT NULL,

    permission_name VARCHAR(150) NOT NULL,

    module_name VARCHAR(100) NOT NULL,

    description TEXT,

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_permission_uuid UNIQUE (uuid),
    CONSTRAINT uq_permission_code UNIQUE (permission_code)
);

CREATE INDEX idx_permission_module
ON permissions(module_name);

CREATE INDEX idx_permission_code
ON permissions(permission_code);

CREATE INDEX idx_permission_status
ON permissions(status);