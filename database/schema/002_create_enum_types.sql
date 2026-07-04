/*
=========================================================
Project : Real Estate CRM SaaS
Version : 1.0.0
Migration: 002_create_enum_types.sql
Author  : Nethravathi + ChatGPT
Purpose : Create ENUM types used throughout the CRM
=========================================================
*/

-- =====================================================
-- Company Status
-- =====================================================
CREATE TYPE company_status AS ENUM (
    'TRIAL',
    'ACTIVE',
    'SUSPENDED',
    'EXPIRED'
);

-- =====================================================
-- User Status
-- =====================================================
CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'LOCKED'
);

-- =====================================================
-- Lead Status
-- =====================================================
CREATE TYPE lead_status AS ENUM (
    'NEW',
    'ASSIGNED',
    'CONTACTED',
    'FOLLOW_UP',
    'VISIT_SCHEDULED',
    'VISITED',
    'NEGOTIATION',
    'BOOKED',
    'LOST'
);

-- =====================================================
-- Lead Priority
-- =====================================================
CREATE TYPE lead_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

-- =====================================================
-- Follow-up Status
-- =====================================================
CREATE TYPE followup_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'MISSED',
    'CANCELLED'
);

-- =====================================================
-- Follow-up Priority
-- =====================================================
CREATE TYPE followup_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

-- =====================================================
-- Call Status
-- =====================================================
CREATE TYPE call_status AS ENUM (
    'CONNECTED',
    'NO_ANSWER',
    'BUSY',
    'SWITCHED_OFF',
    'NOT_REACHABLE',
    'WRONG_NUMBER',
    'CALL_BACK',
    'INTERESTED',
    'NOT_INTERESTED'
);

-- =====================================================
-- Visit Status
-- =====================================================
CREATE TYPE visit_status AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);

-- =====================================================
-- Booking Status
-- =====================================================
CREATE TYPE booking_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'REFUNDED'
);

-- =====================================================
-- Payment Status
-- =====================================================
CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID',
    'OVERDUE'
);

-- =====================================================
-- Property Status
-- =====================================================
CREATE TYPE property_status AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'BOOKED',
    'SOLD',
    'BLOCKED'
);

-- =====================================================
-- Subscription Status
-- =====================================================
CREATE TYPE subscription_status AS ENUM (
    'TRIAL',
    'ACTIVE',
    'SUSPENDED',
    'EXPIRED',
    'CANCELLED'
);

-- =====================================================
-- Attendance Status
-- =====================================================
CREATE TYPE attendance_status AS ENUM (
    'PRESENT',
    'ABSENT',
    'HALF_DAY',
    'LEAVE',
    'HOLIDAY'
);