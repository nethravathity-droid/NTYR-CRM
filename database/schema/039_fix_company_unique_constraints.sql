/*
=========================================================
Migration: 039_fix_company_unique_constraints.sql
Purpose : Allow reuse of company_code/email/phone
           after soft delete by using partial indexes
=========================================================
*/

ALTER TABLE companies DROP CONSTRAINT IF EXISTS uq_company_code;

ALTER TABLE companies DROP CONSTRAINT IF EXISTS uq_company_email;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_code_active
  ON companies (company_code)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_email_active
  ON companies (email)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_phone_active
  ON companies (phone)
  WHERE deleted_at IS NULL;
