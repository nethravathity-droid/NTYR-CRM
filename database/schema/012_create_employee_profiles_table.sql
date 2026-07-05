/*
=========================================================
Project : Real Estate CRM SaaS
Migration: 012_create_employee_profiles_table.sql
Purpose : Employee Profile Details
=========================================================
*/

CREATE TABLE employee_profiles (

    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    date_of_birth DATE,
    gender VARCHAR(20),

    personal_email CITEXT,
    alternate_mobile VARCHAR(20),

    blood_group VARCHAR(10),
    marital_status VARCHAR(20),

    joining_date DATE NOT NULL,

    emergency_contact_name VARCHAR(150),
    emergency_contact_mobile VARCHAR(20),

    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),

    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),

    aadhaar_number VARCHAR(20),
    pan_number VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_employee_profile_uuid UNIQUE(uuid),
    CONSTRAINT uq_employee_profile_user UNIQUE(user_id),

    CONSTRAINT fk_employee_company
        FOREIGN KEY(company_id)
        REFERENCES companies(id),

    CONSTRAINT fk_employee_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_employee_profile_company
ON employee_profiles(company_id);

CREATE INDEX idx_employee_profile_city
ON employee_profiles(city);