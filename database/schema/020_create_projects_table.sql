/*
=========================================================
Migration: 020_create_projects_table.sql
Purpose : Create projects (property inventory) table
=========================================================
*/

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    project_code VARCHAR(50) NOT NULL,
    builder_name VARCHAR(200),
    rera_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    brochure_pdf VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_project_uuid UNIQUE (uuid),
    CONSTRAINT uq_project_code_company UNIQUE (company_id, project_code),
    CONSTRAINT fk_project_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_project_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_project_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_project_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_project_status CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED'))
);

CREATE INDEX IF NOT EXISTS idx_projects_company_status ON projects(company_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_company_deleted ON projects(company_id, deleted_at);
