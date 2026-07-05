Real Estate CRM SaaS
Database Design Document (DDD)

Version: 1.0
Database: PostgreSQL 17+
Architecture: Multi-Tenant SaaS
Prepared By: Nethravathi 

Chapter 1 – Database Philosophy

The database is designed for:

Multi-company SaaS
High Performance
Enterprise Security
Horizontal Scalability
Auditability
Mobile Compatibility
Cloud Deployment

Every table follows common standards to simplify maintenance.

Chapter 2 – Database Standards

Every business table must contain:

| Column     | Type        | Required                 |
| ---------- | ----------- | ------------------------ |
| id         | BIGSERIAL   | Yes                      |
| uuid       | UUID        | Yes                      |
| company_id | BIGINT      | Yes (except SaaS tables) |
| created_at | TIMESTAMPTZ | Yes                      |
| updated_at | TIMESTAMPTZ | Yes                      |
| created_by | BIGINT      | No                       |
| updated_by | BIGINT      | No                       |
| deleted_at | TIMESTAMPTZ | No                       |
| deleted_by | BIGINT      | No                       |

We will never physically delete business records. Soft delete preserves history and supports auditing.

Chapter 3 – Naming Conventions
Tables

Plural, lowercase, snake_case.

Examples:

companies
branches
departments
users
leads
bookings
payments
Columns

Lowercase snake_case.

Examples:

company_id
branch_id
employee_id
booking_amount
created_at
Primary Keys
id BIGSERIAL PRIMARY KEY
Public IDs

Every table gets:

uuid UUID UNIQUE

These are safe to expose in APIs.

Foreign Keys

Use:

company_id
branch_id
department_id
user_id
lead_id
project_id

Never use ambiguous names.

Chapter 4 – Index Standards

Indexes will be created for:

Foreign keys
Search fields
Frequently filtered fields
Frequently sorted fields

Example:

CREATE INDEX idx_leads_company
ON leads(company_id);

CREATE INDEX idx_leads_phone
ON leads(phone1);

CREATE INDEX idx_leads_status
ON leads(status);

CREATE INDEX idx_leads_followup
ON leads(next_followup_at);
Chapter 5 – Relationship Rules
Rule 1

Every company owns its own data.

Company
│
├── Branches
├── Employees
├── Leads
├── Projects
├── Customers
├── Bookings
└── Payments

No data should cross company boundaries.

Rule 2

Business entities reference the company directly.

Even if a lead belongs to a branch, it still stores company_id to simplify reporting.

Rule 3

Every action has history.

Instead of overwriting data:

Lead Status History
Assignment History
Call History
Visit History
Booking History
Payment History

will preserve the full timeline.

Chapter 6 – Planned Tables

This is our target database.| Module         | Planned Tables |
| -------------- | -------------: |
| SaaS           |             12 |
| Organization   |             10 |
| Authentication |              8 |
| CRM            |             22 |
| Property       |             18 |
| Sales          |             14 |
| Finance        |              8 |
| Notifications  |              6 |
| Reports        |             10 |
| Audit          |              8 |

Estimated Total: 116 tables

Chapter 7 – Core ERD

SaaS
│
├── companies
│      │
│      ├── branches
│      │      │
│      │      ├── departments
│      │      │      │
│      │      │      ├── teams
│      │      │      │
│      │      │      ├── users
│      │      │      │      │
│      │      │      │      ├── employee_profiles
│      │      │      │      ├── attendance
│      │      │      │      └── leave_requests
│      │      │
│      │      ├── projects
│      │      │      │
│      │      │      ├── towers
│      │      │      ├── floors
│      │      │      ├── units
│      │      │      └── unit_pricing
│      │      │
│      │      └── leads
│      │             │
│      │             ├── call_logs
│      │             ├── followups
│      │             ├── site_visits
│      │             ├── bookings
│      │             ├── payments
│      │             ├── notifications
│      │             └── documents
│      │
│      └── reports

Chapter 8 – Data Flow

Excel Import
      │
      ▼
Lead
      │
      ▼
Assignment
      │
      ▼
Call Log
      │
      ▼
Follow-up
      │
      ▼
Site Visit
      │
      ▼
Booking
      │
      ▼
Payment
      │
      ▼
Customer

Every stage creates its own record so that the complete customer journey is preserved.

Chapter 9 – Current Migration Status

| Migration                         | Status |
| --------------------------------- | ------ |
| 001_enable_extensions             | ✅      |
| 002_create_enum_types             | ✅      |
| 003_create_companies_table        | ✅      |
| 004_alter_companies_table         | ✅      |
| 005_create_branches_table         | ✅      |
| 006_create_departments_table      | ✅      |
| 007_create_designations_table     | ✅      |
| 008_create_roles_table            | ✅      |
| 009_create_permissions_table      | ✅      |
| 010_create_role_permissions_table | ✅      |
