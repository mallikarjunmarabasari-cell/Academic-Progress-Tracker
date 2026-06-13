# DepartmentHub

Academic Event & Progress Management System for universities — manage events, track weekly progress, view AI-generated insights, and control role-based access across departments.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, Framer Motion, Recharts, TanStack Query, Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: JWT (HMAC-SHA256, custom implementation)
- AI: OpenAI GPT-4o (falls back to static summaries if `OPENAI_API_KEY` not set)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth OpenAPI contract
- `lib/db/src/schema/` — Drizzle schema files (departments, users, events, progress, ai-summaries, audit-logs)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, events, progress, ai, dashboard, users, departments)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware + role guard
- `artifacts/api-server/src/lib/jwt.ts` — custom JWT sign/verify
- `artifacts/department-hub/src/` — React frontend
- `artifacts/department-hub/src/lib/auth.tsx` — AuthContext + token management
- `lib/api-client-react/src/` — generated React Query hooks + custom fetch

## Architecture decisions

- Contract-first: OpenAPI spec drives codegen for both client hooks and Zod schemas; routes validate against generated schemas.
- Role-based access: four roles (ADMIN, FACULTY, STUDENT, MANAGEMENT) enforced via `requireRole()` middleware on each route.
- Password hashing: SHA-256 + static salt (`departmenthub_salt`) — no bcrypt to keep the build simple.
- AI fallback: `artifacts/api-server/src/routes/ai.ts` returns pre-written summaries from DB if `OPENAI_API_KEY` is absent.
- Ordered routes: `/events/upcoming` and `/events/stats` are registered before `/events/:id` to prevent parameter capture.

## Product

- **Login** — role-aware auth with demo credentials shown on screen
- **Dashboard** — live stats (events, attendance, research papers), upcoming events, recent progress
- **Events** — create, filter, and track academic/extracurricular/administrative events by status and priority
- **Progress** — weekly progress logs with metrics (attendance %, papers, events held)
- **AI Insights** — GPT-powered department summaries and trend analysis
- **Users** — admin user management with role assignment
- **Departments** — department listing and management
- **Settings** — profile and preferences

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@department.edu | admin123 |
| Faculty | faculty@department.edu | faculty123 |
| Student | student@department.edu | student123 |
| Management | dean@department.edu | dean123 |

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`.
- Route order matters in Express: specific paths (`/events/upcoming`) before parameterised paths (`/events/:id`).
- The frontend imports `setAuthTokenGetter` from `@workspace/api-client-react` (main export), not the subpath.
- Google Fonts `@import` must be the first line in `index.css` (PostCSS @import ordering rule).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
