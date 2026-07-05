/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 004_alter_companies_table.sql
Purpose : Enhance companies table
=========================================================
*/

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,

ADD COLUMN IF NOT EXISTS trial_start_date DATE,

ADD COLUMN IF NOT EXISTS trial_end_date DATE,

ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,

ADD COLUMN IF NOT EXISTS notes TEXT;