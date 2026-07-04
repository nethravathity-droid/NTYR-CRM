-- =====================================================
-- Real Estate CRM SaaS
-- Migration: 001_enable_extensions.sql
-- Description: Enable required PostgreSQL extensions
-- =====================================================

-- UUID Generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Case-insensitive text (for emails, company codes, etc.)
CREATE EXTENSION IF NOT EXISTS "citext";

-- Trigram search (fast search for names, phones, projects)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- UUID functions (optional compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";