/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 005_create_branches_table.sql
Author  : Nethravathi + ChatGPT
Purpose : Create branches table
=========================================================
*/

CREATE TABLE branches (

    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Public UUID
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Parent Company
    company_id BIGINT NOT NULL,

    -- Branch Details
    branch_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(200) NOT NULL,

    -- Contact Information
    email CITEXT,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),

    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),

    -- Branch Manager (will reference users later)
    manager_user_id BIGINT,

    -- Status
    status user_status NOT NULL DEFAULT 'ACTIVE',

    -- Audit Columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    -- Constraints
    CONSTRAINT uq_branch_uuid UNIQUE (uuid),

    -- A branch code only needs to be unique within a company
    CONSTRAINT uq_company_branch_code UNIQUE (company_id, branch_code),

    -- Foreign Key
    CONSTRAINT fk_branch_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX idx_branch_company
ON branches(company_id);

CREATE INDEX idx_branch_name
ON branches(branch_name);

CREATE INDEX idx_branch_city
ON branches(city);

CREATE INDEX idx_branch_status
ON branches(status);