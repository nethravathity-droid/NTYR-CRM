# AGENTS.md

## Commands

### Backend (./backend)
- `npm run dev` — start dev server with tsx watch
- `npm run build` — compile TypeScript
- `npm run typecheck` — type-check without emitting (tsc --noEmit)
- `npm run db:schema` — apply database schema files
- `npm run seed` — run seed script

### Frontend (./frontend)
- `npm run dev` — start Vite dev server
- `npm run build` — type-check + Vite build
- `npm run lint` — run oxlint
- `npm run preview` — preview production build

## Notes
- Frontend is in `frontend/`; Vercel Root Directory must point there
- Backend is in `backend/`; Render Root Directory must be `backend`
- Both projects use TypeScript with ESM imports
