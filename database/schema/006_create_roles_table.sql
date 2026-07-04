/*
=========================================================
Project : Real Estate CRM SaaS
Migration: 006_create_departments_table.sql
Purpose : Create departments table
=========================================================
*/

CREATE TABLE departments (

    id BIGSERIAL PRIMARY KEY,

    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,

    branch_id BIGINT NOT NULL,

    department_code VARCHAR(20) NOT NULL,

    department_name VARCHAR(100) NOT NULL,

    description TEXT,

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_department_uuid UNIQUE (uuid),

    CONSTRAINT uq_department_code
        UNIQUE (branch_id, department_code),

    CONSTRAINT fk_department_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_department_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_department_company
ON departments(company_id);

CREATE INDEX idx_department_branch
ON departments(branch_id);

CREATE INDEX idx_department_name
ON departments(department_name);