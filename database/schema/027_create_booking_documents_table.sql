/*
=========================================================
Migration: 027_create_booking_documents_table.sql
Purpose : Store customer KYC and booking documents
=========================================================
*/

CREATE TABLE IF NOT EXISTS booking_documents (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_booking_document_uuid UNIQUE (uuid),
    CONSTRAINT fk_booking_document_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_booking_document_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_document_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_document_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_booking_document_type CHECK (
        document_type IN (
            'AADHAAR',
            'PAN',
            'PASSPORT',
            'ADDRESS_PROOF',
            'PHOTOGRAPH',
            'BOOKING_FORM',
            'AGREEMENT_COPY'
        )
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_document_active_type
ON booking_documents(booking_id, document_type)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_booking_documents_booking ON booking_documents(booking_id);
