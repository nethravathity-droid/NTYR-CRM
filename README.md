# Real Estate CRM SaaS

Multi-tenant real estate CRM with role-based workspaces for platform super admins, company admins, managers, telecallers, and sales executives.

## Stack

- **Frontend:** React, TypeScript, Vite, TanStack Query, Tailwind
- **Backend:** Node.js, Express, PostgreSQL, Knex
- **Auth:** JWT (access + refresh), company-scoped login

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Quick start

### 1. Database

Create a database (example name `real_estate_crm`) and configure `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=real_estate_crm
DB_USER=postgres
DB_PASSWORD=your_password
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
CORS_ORIGIN=http://localhost:5173
```

Apply schema and seed platform permissions + super admin:

```bash
cd backend
npm install
npm run db:schema
npm run seed
npm run dev
```

The seed is idempotent and creates only the **platform super admin** account. Tenant companies are created from the platform workspace.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

```bash
npm run dev
```

Open http://localhost:5173

## First-time setup

1. Sign in as **platform super admin** (credentials printed by `npm run seed`).
2. Go to **Companies → Add Company** and register each tenant with:
   - **Company code** (used at login)
   - **Initial admin username and password**
3. Share those credentials with the tenant. They sign in on the login page with company code + username + password.
4. For companies created before admin provisioning was added, open the company details page and use **Create tenant login**.

**Change the default platform super admin password before production deployment.**

## Modules

| Module | Capabilities |
|--------|----------------|
| Platform | Companies, subscriptions view, activity log, analytics |
| Leads and customers | CRUD, import CSV, assign, bulk update, search and filters |
| Follow-ups | List, today, calendar, timeline |
| Calls | Dashboard, call log, link to leads |
| Visits | Schedule, calendar, feedback |
| Projects and inventory | Projects, towers, floors, units |
| Bookings | Create, approval workflow, documents |
| Payments | Receipts, schedule, dashboard |
| Reports | Lead, sales, employee, visit, booking, payment reports |
| Employees | CRUD, roles, branches, reset password |

## Production build

```bash
cd backend && npm run build
cd frontend && npm run build
```

Serve frontend static files and run `node dist/server.js` for the API (set production env vars and `CORS_ORIGIN` to your frontend URL).

## Useful scripts (backend)

| Script | Purpose |
|--------|---------|
| npm run db:schema | Apply SQL migrations in database/schema |
| npm run seed | Permissions and platform super admin |
| npm run db:test | Test DB connection |
