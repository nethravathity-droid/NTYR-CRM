/*
=========================================================
Project : Real Estate CRM SaaS
Migration: 014_create_master_categories.sql
Purpose : Master Categories
=========================================================
*/

CREATE TABLE master_categories (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT,

    category_code VARCHAR(100) NOT NULL,

    category_name VARCHAR(150) NOT NULL,

    description TEXT,

    is_system BOOLEAN NOT NULL DEFAULT TRUE,

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_master_category_uuid
        UNIQUE(uuid),

    CONSTRAINT uq_company_category
        UNIQUE(company_id, category_code),

    CONSTRAINT fk_master_category_company
        FOREIGN KEY(company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_master_category_company
ON master_categories(company_id);