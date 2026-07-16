/*
=========================================================
Migration: 022_create_floors_table.sql
Purpose : Create floors table for towers
=========================================================
*/

CREATE TABLE IF NOT EXISTS floors (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    tower_id BIGINT NOT NULL,
    floor_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_floor_uuid UNIQUE (uuid),
    CONSTRAINT uq_floor_tower_number UNIQUE (tower_id, floor_number),
    CONSTRAINT fk_floor_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_floor_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_floor_tower FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE,
    CONSTRAINT fk_floor_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_floor_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_floor_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_floors_tower ON floors(tower_id);
