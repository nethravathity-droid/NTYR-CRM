/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 011_create_users_table.sql
Purpose : Create users table
=========================================================
*/

CREATE TABLE users (

    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Public ID
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Company
    company_id BIGINT NOT NULL,

    -- Organization
    branch_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    designation_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,

    -- Manager (Self Reference)
    manager_user_id BIGINT,

    -- Login
    employee_code VARCHAR(20) NOT NULL,
    username CITEXT NOT NULL,
    password_hash TEXT NOT NULL,

    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    display_name VARCHAR(200),

    official_email CITEXT,
    mobile VARCHAR(20) NOT NULL,

    profile_photo_url TEXT,

    -- Security
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    account_locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,

    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    last_login_device TEXT,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,

    fcm_token TEXT,

    -- Status
    status user_status NOT NULL DEFAULT 'ACTIVE',

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    -- Constraints
    CONSTRAINT uq_user_uuid
        UNIQUE(uuid),

    CONSTRAINT uq_company_employee
        UNIQUE(company_id, employee_code),

    CONSTRAINT uq_company_username
        UNIQUE(company_id, username),

CONSTRAINT uq_user_company_email
    UNIQUE(company_id, official_email),

    -- Foreign Keys
    CONSTRAINT fk_user_company
        FOREIGN KEY(company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_branch
        FOREIGN KEY(branch_id)
        REFERENCES branches(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_department
        FOREIGN KEY(department_id)
        REFERENCES departments(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_designation
        FOREIGN KEY(designation_id)
        REFERENCES designations(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_role
        FOREIGN KEY(role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_manager
        FOREIGN KEY(manager_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX idx_users_company
ON users(company_id);

CREATE INDEX idx_users_branch
ON users(branch_id);

CREATE INDEX idx_users_department
ON users(department_id);

CREATE INDEX idx_users_role
ON users(role_id);

CREATE INDEX idx_users_manager
ON users(manager_user_id);

CREATE INDEX idx_users_mobile
ON users(mobile);

CREATE INDEX idx_users_status
ON users(status);

CREATE INDEX idx_users_employee_code
ON users(employee_code);