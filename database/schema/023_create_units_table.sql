/*
=========================================================
Migration: 023_create_units_table.sql
Purpose : Create inventory units table
=========================================================
*/

CREATE TABLE IF NOT EXISTS units (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    tower_id BIGINT,
    floor_id BIGINT,
    unit_number VARCHAR(50) NOT NULL,
    bhk_type VARCHAR(50),
    super_built_up_area NUMERIC(12, 2),
    carpet_area NUMERIC(12, 2),
    facing VARCHAR(50),
    price NUMERIC(15, 2),
    plc_charges NUMERIC(15, 2),
    availability VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_unit_uuid UNIQUE (uuid),
    CONSTRAINT uq_unit_project_number UNIQUE (project_id, unit_number),
    CONSTRAINT fk_unit_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_unit_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_unit_tower FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE SET NULL,
    CONSTRAINT fk_unit_floor FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE SET NULL,
    CONSTRAINT fk_unit_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_unit_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_unit_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_unit_availability CHECK (availability IN ('AVAILABLE', 'HOLD', 'BOOKED', 'SOLD'))
);

CREATE INDEX IF NOT EXISTS idx_units_project_availability ON units(project_id, availability);
CREATE INDEX IF NOT EXISTS idx_units_company_deleted ON units(company_id, deleted_at);
