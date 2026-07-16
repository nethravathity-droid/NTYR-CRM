/*
=========================================================
Migration: 026_create_bookings_table.sql
Purpose : Create bookings table for unit booking management
=========================================================
*/

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    booking_number VARCHAR(30) NOT NULL,
    lead_id BIGINT,
    customer_name VARCHAR(200) NOT NULL,
    project_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    booking_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    final_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_plan TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    telecaller_user_id BIGINT,
    sales_executive_user_id BIGINT,
    branch_id BIGINT,
    notes TEXT,
    approval_notes TEXT,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_booking_uuid UNIQUE (uuid),
    CONSTRAINT uq_booking_company_number UNIQUE (company_id, booking_number),
    CONSTRAINT fk_booking_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_booking_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_telecaller FOREIGN KEY (telecaller_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_sales_executive FOREIGN KEY (sales_executive_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_booking_status CHECK (
        status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')
    ),
    CONSTRAINT chk_booking_amounts CHECK (
        booking_amount >= 0
        AND total_unit_price >= 0
        AND discount_amount >= 0
        AND final_price >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_bookings_company_status ON bookings(company_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_company_deleted ON bookings(company_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_project ON bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_unit ON bookings(unit_id);
