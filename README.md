# Bigbisort — Angular + Node.js + MySQL

Monorepo for the Bigbisort marketplace: an Angular frontend and a
TypeScript/Express backend on MySQL.

The backend is a port of the original Spring Boot service, which ran on
PostgreSQL and cannot be hosted on the Business web hosting plan — MySQL and
Node both can.

```
backend/    Express + Prisma API (TypeScript)
frontend/   Angular application
```

## Running locally

Both halves run at once: the API on port 8081, the app on 4200.

### Backend

```bash
cd backend
npm install
cp .env.example .env     # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npm run dev
```

The API serves under `/bigbisort-imp-exp` — the context path the original
Spring service used, which the frontend has baked into its `apiBaseUrl`.
`GET http://localhost:8081/health` should return `{"status":"UP"}`.

Seed sample data with `npm run seed`, and check every endpoint with
`npm run smoke` while the server is running.

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

`npm install` needs `--legacy-peer-deps`: `karma@~6.3.0` in `package.json`
conflicts with the `karma@^6.4.0` peer that `@angular/build` wants.

API URLs come from `src/environments/environment.ts` for development and
`environment.prod.ts` for production builds. No service should hardcode a host.

## Database

MySQL 8 or MariaDB. Create the schema with a case-insensitive collation, which
the queries rely on for name lookups:

```sql
CREATE DATABASE bigbisort CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

`backend/prisma/schema.prisma` holds all 11 models. `prisma migrate dev` also
needs `SHADOW_DATABASE_URL` pointing at a second, empty database;
`prisma migrate deploy` does not, so deployments need only `DATABASE_URL`.

## Deployment

Both halves deploy as separate apps on the same Hostinger plan.

| | Build command | Output / start |
| --- | --- | --- |
| frontend | `npm run build` | `dist` |
| backend | `npm run build` | `npm start` |

Set the backend's environment variables in the hosting panel. Nothing secret
belongs in this repository — `.env` is ignored, and only `.env.example` is
committed.

## Notes

`backend/README.md` lists every place the port deliberately differs from the
Java original, including several defects that are fixed rather than
reproduced. Read it before comparing behaviour against the old service.

Some endpoints the frontend calls have no backend implementation in either the
Java service or this port; they are listed at the end of `backend/README.md`.
