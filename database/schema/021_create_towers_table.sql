/*
=========================================================
Migration: 021_create_towers_table.sql
Purpose : Create towers table for projects
=========================================================
*/

CREATE TABLE IF NOT EXISTS towers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    tower_name VARCHAR(100) NOT NULL,
    number_of_floors INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_tower_uuid UNIQUE (uuid),
    CONSTRAINT uq_tower_name_project UNIQUE (project_id, tower_name),
    CONSTRAINT fk_tower_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_tower_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_tower_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tower_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tower_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_tower_floors CHECK (number_of_floors >= 0)
);

CREATE INDEX IF NOT EXISTS idx_towers_project ON towers(project_id);
