/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 003_create_companies_table.sql
Author  : Nethravathi + ChatGPT
Purpose : Create companies table
=========================================================
*/

CREATE TABLE companies (

    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Public UUID
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Company Details
    company_code CITEXT NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(250),

    owner_name VARCHAR(150) NOT NULL,

    -- Registration Details
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    rera_number VARCHAR(50),

    -- Contact Information
    email CITEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    website VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),

    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    postal_code VARCHAR(20) NOT NULL,

    -- Branding
    logo_url TEXT,
    favicon_url TEXT,

    -- Settings
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    -- Status
    status company_status NOT NULL DEFAULT 'TRIAL',

    -- Audit Columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    -- Constraints
    CONSTRAINT uq_company_uuid UNIQUE (uuid),
    CONSTRAINT uq_company_code UNIQUE (company_code),
    CONSTRAINT uq_company_email UNIQUE (email)
);


-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX idx_company_name
ON companies(company_name);

CREATE INDEX idx_company_status
ON companies(status);

CREATE INDEX idx_company_city
ON companies(city);