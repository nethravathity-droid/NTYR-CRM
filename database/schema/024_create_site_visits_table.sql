/*
=========================================================
Migration: 024_create_site_visits_table.sql
Purpose : Create site visits table
=========================================================
*/

CREATE TABLE IF NOT EXISTS site_visits (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    visit_number VARCHAR(30) NOT NULL,
    lead_id BIGINT,
    customer_name VARCHAR(200) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    project_id BIGINT,
    unit_id BIGINT,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    assigned_user_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    transportation_required BOOLEAN NOT NULL DEFAULT FALSE,
    pickup_location VARCHAR(500),
    feedback TEXT,
    rating SMALLINT,
    next_action VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_site_visit_uuid UNIQUE (uuid),
    CONSTRAINT uq_site_visit_number_company UNIQUE (company_id, visit_number),
    CONSTRAINT fk_site_visit_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_site_visit_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_visit_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_visit_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_visit_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_visit_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_visit_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_visit_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_site_visit_status CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    CONSTRAINT chk_site_visit_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

CREATE INDEX IF NOT EXISTS idx_site_visits_company_date ON site_visits(company_id, visit_date, status);
CREATE INDEX IF NOT EXISTS idx_site_visits_company_deleted ON site_visits(company_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_lead ON site_visits(lead_id);
