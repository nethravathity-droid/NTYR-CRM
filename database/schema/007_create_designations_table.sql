/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 007_create_designations_table.sql
Purpose : Create designations table
=========================================================
*/

CREATE TABLE designations (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,

    designation_code VARCHAR(20) NOT NULL,

    designation_name VARCHAR(100) NOT NULL,

    description TEXT,

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_designation_uuid UNIQUE (uuid),

    CONSTRAINT uq_company_designation UNIQUE (company_id, designation_code),

    CONSTRAINT fk_designation_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_designation_company
ON designations(company_id);

CREATE INDEX idx_designation_name
ON designations(designation_name);

CREATE INDEX idx_designation_status
ON designations(status);