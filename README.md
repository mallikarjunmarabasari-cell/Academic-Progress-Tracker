# AI-Powered Department Performance & Accreditation Intelligence System (ADPAIS)

## Product Requirements Document (PRD)

### Product Vision
ADPAIS transforms departmental activities into measurable institutional intelligence by combining performance tracking, engagement analytics, accreditation readiness, risk detection, and AI-powered insights.

### Problem Statement
Colleges often manage events, student activities, faculty achievements, committee work, and accreditation evidence using spreadsheets, chats, emails, and paper files. This leads to missing records, poor visibility, delayed reporting, accreditation gaps, and no performant decision support for the department.

ADPAIS answers the core questions:
- Are we progressing?
- Which activities create impact?
- Which committees are underperforming?
- What evidence is missing for accreditation?

### Product Goals
- Centralize department operations into a single source of truth.
- Provide rich department intelligence with health scores, risk indexes, and engagement metrics.
- Support accreditation readiness for NBA, NAAC, ISO, and internal audits.
- Enable AI assistance for weekly summaries, monthly reports, semester reviews, and improvement recommendations.

### User Roles
- **Student**: View events, register participation, submit achievements, upload evidence, track progress.
- **Faculty**: Create activities, review submissions, manage committees, generate reports, view analytics.
- **Department Coordinator**: Manage faculty, approve reports, monitor KPIs, configure scoring.
- **HOD / Department Head**: Full admin control, accreditation exports, strategic dashboards, risk monitoring.
- **College Management**: Multi-department analytics, executive reports, performance benchmarking.

### Core Modules
1. **Authentication**: Secure login, JWT, RBAC, password recovery, session management.
2. **Weekly Event Intelligence**: Create event bundles, categorize activities, upload evidence, capture attendance and outcomes.
3. **Progress Tracking**: Track initiatives, clubs, research, placements, workshops with completion, delay, blocker, and impact metrics.
4. **AI Summary Generation**: Generate weekly, monthly, and semester summaries plus improvement recommendations.
5. **Department Health Score**: Score based on completion, participation, faculty activity, documentation quality, and timely reporting.
6. **Risk Detection Engine**: Detect attendance risk, documentation gaps, accreditation risk, and committee inactivity.
7. **Accreditation Intelligence**: Organize evidence packages for curriculum, teaching-learning, research, infrastructure, student support, governance, and values.
8. **Analytics Dashboard**: Executive KPIs for total events, participants, faculty contribution, running projects, research output, placement, health, and risk.

## Product Names & Positioning
- **Product Name**: ADPAIS
- **Full Name**: AI-Powered Department Performance & Accreditation Intelligence System
- **Platform Type**: Academic Intelligence Platform
- **Value Proposition**: Move beyond event tracking to institutional intelligence, accreditation readiness, and AI-driven decision support.

## Design Philosophy
ADPAIS uses a premium claymorphism style with executive visuals, soft shadows, rounded corners, and calming academic colors.

### Suggested Palette
- **Primary**: Lavender `#A78BFA`
- **Secondary**: Mint `#6EE7B7`
- **Accent**: Baby Blue `#93C5FD`
- **Success**: Soft Green `#86EFAC`
- **Warning**: Soft Amber `#FCD34D`
- **Danger**: Coral `#FCA5A5`
- **Background**: `#F8F7FF`

## Current Implementation Notes
- Next.js + TypeScript + Tailwind front-end
- Supabase auth with Google OAuth
- Prisma-backed PostgreSQL data layer
- AI summary endpoint with OpenAI fallback
- Progress tracker, events, and dashboard pages

## Quick Start
```bash
cd platform
pnpm install
pnpm dev
```

## Current Deployment Guidance
- **Frontend**: Vercel recommended for Next.js, root folder `platform`
- **Backend**: Render can host the optional `artifacts/api-server` Express service
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `OPENAI_API_KEY`, `SUPABASE_PUBLISHABLE_KEY`

## Reviewer Positioning
For reviewer impact, present ADPAIS as an academic intelligence system that:
- delivers accreditation evidence packages,
- measures department health and risk,
- generates executive AI summaries,
- and supports strategic decision-making across students, faculty, and management.

## Changelog (short)

- 2026-06-28: Rebranded to ADPAIS; added CI and deployment docs; cleaned legacy assets.
