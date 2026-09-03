/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 033_add_must_change_password_to_users.sql
Purpose : Force password change on first login (dev seed)
=========================================================
*/

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_must_change_password
ON users(must_change_password)
WHERE must_change_password = TRUE;
