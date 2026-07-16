/*
=========================================================
Migration: 029_create_payments_table.sql
Purpose : Create payments table for booking payment tracking
=========================================================
*/

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    payment_number VARCHAR(30) NOT NULL,
    booking_id BIGINT NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    project_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    payment_type VARCHAR(30) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_mode VARCHAR(20),
    transaction_reference VARCHAR(100),
    bank_name VARCHAR(200),
    receipt_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    receipt_file_path VARCHAR(500),
    receipt_original_file_name VARCHAR(255),
    receipt_mime_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_payment_uuid UNIQUE (uuid),
    CONSTRAINT uq_payment_company_number UNIQUE (company_id, payment_number),
    CONSTRAINT fk_payment_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_payment_type CHECK (
        payment_type IN ('BOOKING_AMOUNT', 'DOWN_PAYMENT', 'INSTALLMENT', 'PLC', 'REGISTRATION', 'OTHER')
    ),
    CONSTRAINT chk_payment_mode CHECK (
        payment_mode IS NULL OR payment_mode IN ('CASH', 'UPI', 'NEFT', 'RTGS', 'CHEQUE', 'CARD')
    ),
    CONSTRAINT chk_payment_status CHECK (
        status IN ('PENDING', 'PAID', 'PARTIAL', 'FAILED', 'REFUNDED')
    ),
    CONSTRAINT chk_payment_amounts CHECK (amount >= 0 AND due_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_company_status ON payments(company_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_company_deleted ON payments(company_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
