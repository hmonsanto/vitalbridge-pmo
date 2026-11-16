# VitalBridge RX PMO Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure, animated PMO dashboard where Henry (owner) manages hospital projects and Ned (viewer) can only read.

**Architecture:** Next.js App Router (TypeScript) server-rendered pages read Supabase Postgres through `@supabase/ssr` cookie sessions. All access control lives in Postgres Row Level Security; the UI only reflects it. Pure domain logic (fee, 340B windows, gate rules) is isolated in `src/domain` and unit-tested.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Supabase (Postgres, Auth, RLS), zod, Vitest, Playwright, pgTAP (`supabase test db`).

**Spec:** `docs/superpowers/specs/2026-11-15-pmo-dashboard-design.md`

## Global Constraints

- Stack: "Next.js (React, TypeScript) + Supabase (Postgres, Auth, Row Level Security)".
- UI and code in English; no Spanish/slang in artifacts.
- No public sign-up: "accounts created by invitation only".
- Roles: `owner` (full access) and `viewer` (`SELECT` only); anonymous: nothing. Enforced by RLS on every table.
- Owner account requires TOTP MFA; offered to the viewer.
- Session via `@supabase/ssr` httpOnly secure cookies; service-role key never reaches the browser; secrets only in env vars, never committed.
- Zod validation on every write; strict security headers and CSP; rate limiting on login; audit log of writes and sign-ins.
- No patient data of any kind is stored.
- Scenario `A | B | C` is required when a hospital project is created.
- Fee = 30% of incremental gross profit (actual − baseline), reconciled monthly.
- 340B registration windows: 1st–15th of January, April, July, October.
- Motion honors `prefers-reduced-motion`; light and dark theme.
- Version 1 excludes: Jira/Teams/Outlook/Asana integrations, voice/AI, PPT/Excel export.

## Review Focus

1. Viewer attempts INSERT/UPDATE/DELETE through the API directly (bypassing the UI): must be rejected by RLS.
2. Unauthenticated request to any app route or table: redirected to login / zero rows.
3. Hospital with no baseline entries yet: panel shows an empty state, fee is 0, no NaN or crash.
4. Actual below baseline: fee is 0 (nothing owed), never negative.
5. Dates on window boundaries (Jan 1, Jan 15, Jan 16, Dec 31): 340B window logic is inclusive on both ends and rolls to next quarter correctly.

---

## File Structure

```
src/app/(auth)/login/page.tsx        login form
src/app/(app)/layout.tsx             authenticated shell
src/app/(app)/page.tsx               portfolio home
src/app/(app)/hospitals/[id]/page.tsx hospital workspace
src/app/(app)/pmo/page.tsx           PMO workstream
src/app/(app)/calendar/page.tsx      dependency calendar
src/app/(app)/todos/page.tsx         to-dos and meetings
src/middleware.ts                    route guard + headers
src/lib/supabase/{server,client,middleware}.ts
src/lib/auth.ts                      getSessionRole()
src/lib/validation.ts                zod schemas
src/lib/rate-limit.ts
src/lib/audit.ts
src/domain/{fee,windows340b,gates}.ts pure logic
src/components/ui/*                  Card, Badge, Stepper, CountUp, PageTransition
supabase/migrations/*.sql            schema, RLS
supabase/seed.sql                    demo data
supabase/tests/*.sql                 pgTAP RLS tests
tests/                               Vitest unit + Playwright e2e
```

---

### Task 1: Project scaffold and tooling

**Files:**
- Create: Next.js app at repo root (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `.env.example`, `.gitignore`)
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces: `npm run dev|build|test|lint`; `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only).

- [ ] **Step 1:** `git init`, then scaffold Next.js (TypeScript, Tailwind, App Router, `src/` dir) and install `framer-motion zod @supabase/supabase-js @supabase/ssr` plus dev deps `vitest @playwright/test`.
- [ ] **Step 2:** Write `tests/smoke.test.ts` asserting `1 + 1 === 2`; run `npm test`. Expected: PASS (proves runner works).
- [ ] **Step 3:** Ensure `.gitignore` excludes `.env*` except `.env.example`.
- [ ] **Step 4:** Commit `chore: scaffold next.js app with tooling`.

### Task 2: Database schema and seed

**Files:**
- Create: `supabase/migrations/0001_schema.sql`, `supabase/seed.sql`
- Test: `supabase/tests/schema.test.sql`

**Interfaces:**
- Produces tables: `profiles(id uuid pk → auth.users, role text check in ('owner','viewer'))`, `projects(id, name, scenario check in ('A','B','C'), current_phase int 1..6, kind check in ('hospital','pmo'))`, `phases`, `gates(project_id, code, decision check in ('go','go_with_conditions','replan','stop'), decided_on, notes)`, `deliverables(project_id, phase, name, owner, status, doc_url, remarks)`, `risks(project_id, title, severity, owner, status)`, `dependencies(project_id, type check in ('license','dea','340b','payer','accreditation','other'), due_date, status)`, `baseline_entries(project_id, month date, baseline numeric, actual numeric)`, `todos`, `meetings`, `audit_log(id, actor, action, table_name, row_id, at)`.

- [ ] **Step 1:** Write pgTAP test: inserting a project with scenario `'D'` fails; inserting with `'A'` succeeds.
- [ ] **Step 2:** Run `supabase test db`. Expected: FAIL (no tables).
- [ ] **Step 3:** Write the migration with the tables above, constraints and FKs.
- [ ] **Step 4:** Seed one pmo project (gates G0–G5) and two demo hospitals (scenarios A and C).
- [ ] **Step 5:** Run `supabase test db`. Expected: PASS. Commit `feat(db): schema and seed`.

### Task 3: Row Level Security

**Files:**
- Create: `supabase/migrations/0002_rls.sql`
- Test: `supabase/tests/rls.test.sql`

**Interfaces:**
- Produces: SQL function `public.is_owner() returns boolean` (reads `profiles.role` for `auth.uid()`); policies on every table: owner `ALL`, viewer `SELECT`, anon none.

- [ ] **Step 1:** pgTAP tests, as three roles: anon `select` on `projects` returns 0 rows; viewer `select` returns rows; viewer `insert`, `update`, `delete` on `projects`, `risks`, `baseline_entries` each raise/affect 0 rows; owner can do all.
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Enable RLS on every table and create `is_owner()` plus the policies. `audit_log` is insert-only for authenticated, select for owner.
- [ ] **Step 4:** Run; Expected: PASS. Commit `feat(db): row level security`.

### Task 4: Authentication, roles and MFA

**Files:**
- Create: `src/lib/supabase/{server,client,middleware}.ts`, `src/lib/auth.ts`, `src/middleware.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/mfa/page.tsx`
- Test: `tests/e2e/auth.spec.ts`

**Interfaces:**
- Produces: `getSessionRole(): Promise<'owner' | 'viewer' | null>`; middleware redirects any non-login route to `/login` when no session, and to `/mfa` when owner has not completed TOTP (`aal2`).

- [ ] **Step 1:** Playwright test: visiting `/` unauthenticated lands on `/login`; wrong password shows "Invalid credentials" with no hint of which field; sign-up route does not exist (404).
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Implement Supabase SSR clients (cookie-based), middleware guard, login page, TOTP enrol/verify page. Disable sign-ups in Supabase config; document inviting a user from the dashboard.
- [ ] **Step 4:** Add Playwright test: an owner session without `aal2` is redirected to `/mfa`.
- [ ] **Step 5:** Run; Expected: PASS. Commit `feat(auth): login, roles, mfa`.

### Task 5: Hardening — headers, validation, rate limit, audit

**Files:**
- Create: `src/lib/validation.ts`, `src/lib/rate-limit.ts`, `src/lib/audit.ts`; modify `next.config.ts` (headers/CSP)
- Test: `tests/validation.test.ts`, `tests/rate-limit.test.ts`

**Interfaces:**
- Produces: `projectSchema`, `riskSchema`, `deliverableSchema`, `baselineEntrySchema` (zod); `rateLimit(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterMs: number }`; `recordAudit(action: string, table: string, rowId: string): Promise<void>`.

- [ ] **Step 1:** Tests: `projectSchema` rejects scenario `'D'` and empty name; `rateLimit` allows 5 attempts then blocks the 6th with `retryAfterMs > 0`.
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Implement schemas and limiter; apply limiter to the login server action keyed by IP + email; call `recordAudit` on sign-in and every write action.
- [ ] **Step 4:** Add CSP, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS in `next.config.ts`; verify with an e2e test reading response headers on `/login`.
- [ ] **Step 5:** Run; Expected: PASS. Commit `feat(security): headers, validation, rate limit, audit`.

### Task 6: Pure domain logic (fee, 340B windows, gates)

**Files:**
- Create: `src/domain/fee.ts`, `src/domain/windows340b.ts`, `src/domain/gates.ts`
- Test: `tests/domain/*.test.ts`

**Interfaces:**
- Produces: `calcFee(entries: {baseline: number; actual: number}[]): { incremental: number; fee: number }`; `next340bWindow(from: Date): { start: Date; end: Date; isOpen: boolean }`; `canAdvance(phase: number, gateDecision: GateDecision | null): boolean` (true only for `go` or `go_with_conditions`).

- [ ] **Step 1:** Tests with spec values: baseline 100, actual 140 → incremental 40, fee 12; actual below baseline → fee 0; empty array → `{0, 0}`; window: Jan 1 and Jan 15 open, Jan 16 closed and next window starts Apr 1, Dec 31 → next window Jan 1 of the next year; `canAdvance(2, 'stop')` false.
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Implement. Fee sums monthly incremental over entries where actual > baseline only, times 0.30, rounded to cents.
- [ ] **Step 4:** Run; Expected: PASS. Commit `feat(domain): fee, 340b windows, gate rules`.

### Task 7: App shell, design system and motion

**Files:**
- Create: `src/app/(app)/layout.tsx`, `src/components/ui/{Card,Badge,Stepper,CountUp,PageTransition,ThemeToggle}.tsx`
- Test: `tests/components/ui.test.tsx`

**Interfaces:**
- Produces: `<Stepper phases={string[]} current={number} gates={Record<number, GateDecision>} />`, `<CountUp value={number} />`, `<Badge tone="ok"|"warn"|"danger"|"info">`; sidebar nav (Portfolio, Hospitals, PMO, Calendar, To-Do); role badge in header.

- [ ] **Step 1:** Tests: `CountUp` renders final value immediately when `prefers-reduced-motion` is set; `Stepper` marks phase 3 as current and phase 1–2 complete.
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Implement glass-style tokens (light/dark), shell with sidebar and page transitions via Framer Motion, components above.
- [ ] **Step 4:** Run; Expected: PASS. Commit `feat(ui): shell, components, motion`.

### Task 8: Portfolio home

**Files:**
- Create: `src/app/(app)/page.tsx`, `src/app/(app)/_components/KpiStrip.tsx`, `MajorRisks.tsx`
- Test: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Consumes: Task 6 `next340bWindow`, Task 7 components.
- Produces: KPI strip (hospitals, gates pending, open risks, overdue dependencies), major-risks card, today's items.

- [ ] **Step 1:** E2E as owner against seed: KPI shows 2 hospitals; a critical seeded risk appears in Major Risks; empty database shows empty states, no errors.
- [ ] **Step 2:** Run; Expected: FAIL. **Step 3:** Implement server-component queries and cards with staggered entrance. **Step 4:** Run; Expected: PASS. Commit `feat: portfolio home`.

### Task 9: Hospital workspace

**Files:**
- Create: `src/app/(app)/hospitals/[id]/page.tsx`, `new/page.tsx`, `actions.ts` (create/update with zod + audit)
- Test: `tests/e2e/hospital.spec.ts`

**Interfaces:**
- Consumes: Task 5 schemas and `recordAudit`; Task 6 `canAdvance`.
- Produces: scenario badge, stepper with gate decisions, deliverables table (status, owner, doc link, remarks), create-hospital form requiring scenario.

- [ ] **Step 1:** E2E: owner creates hospital without scenario → validation error; with `C` → appears as a tab; viewer sees the page with no edit controls rendered and a forced POST returns an error.
- [ ] **Step 2:** Run; Expected: FAIL. **Step 3:** Implement; edit controls render only for `owner`, but authorization still relies on RLS. **Step 4:** Run; Expected: PASS. Commit `feat: hospital workspace`.

### Task 10: Risks, dependencies and calendar

**Files:**
- Create: `src/app/(app)/calendar/page.tsx`, risks and dependencies sections in the hospital page
- Test: `tests/e2e/dependencies.spec.ts`

**Interfaces:**
- Consumes: Task 6 `next340bWindow`.
- Produces: dependency list with due dates and overdue highlighting; calendar showing dependency deadlines and the 340B window.

- [ ] **Step 1:** E2E: a dependency due yesterday renders as overdue; calendar shows the next 340B window with open/closed state. **Step 2:** Run; Expected: FAIL. **Step 3:** Implement. **Step 4:** Run; Expected: PASS. Commit `feat: risks, dependencies, calendar`.

### Task 11: Baseline and fee panel

**Files:**
- Create: `src/app/(app)/hospitals/[id]/_components/BaselinePanel.tsx`, `actions.ts` additions
- Test: `tests/e2e/baseline.spec.ts`

**Interfaces:**
- Consumes: `calcFee`, `baselineEntrySchema`.
- Produces: monthly entry form (owner), table, trend chart, fee estimate card.

- [ ] **Step 1:** E2E: no entries → empty state and fee `$0.00`; entry baseline 100 / actual 140 → incremental $40.00, fee $12.00; actual below baseline → fee $0.00. **Step 2:** Run; Expected: FAIL. **Step 3:** Implement with a small SVG trend chart. **Step 4:** Run; Expected: PASS. Commit `feat: baseline and fee panel`.

### Task 12: PMO workstream, to-dos and meetings

**Files:**
- Create: `src/app/(app)/pmo/page.tsx`, `src/app/(app)/todos/page.tsx`
- Test: `tests/e2e/pmo.spec.ts`

**Interfaces:**
- Consumes: `Stepper`, gate rules (kind = `pmo`, gates G0–G5).
- Produces: PMO plan view reusing the hospital components; to-do list (add, complete) and meetings list entered manually.

- [ ] **Step 1:** E2E: PMO page shows G0–G5; owner adds and completes a to-do; viewer cannot add. **Step 2:** Run; Expected: FAIL. **Step 3:** Implement. **Step 4:** Run; Expected: PASS. Commit `feat: pmo workstream, todos, meetings`.

### Task 13: Security review and deployment guide

**Files:**
- Create: `docs/security-checklist.md`, `docs/deployment.md`
- Test: full run of `supabase test db`, Vitest, Playwright

- [ ] **Step 1:** Run all suites; Expected: PASS. Run `npm audit`; resolve high/critical.
- [ ] **Step 2:** Write `docs/deployment.md`: create Supabase project, apply migrations, disable sign-ups, create owner and viewer users, set env vars in Vercel, enforce HTTPS, enable Supabase backups, restore procedure.
- [ ] **Step 3:** Write `docs/security-checklist.md` verifying each item in spec section 8.3 with evidence (test name or config).
- [ ] **Step 4:** Commit `docs: security checklist and deployment guide`.

---

## Self-Review

- **Spec coverage:** modules in 8.1 → Tasks 8–12; data model 8.2 → Task 2; security 8.3 → Tasks 3, 4, 5, 13; look and motion 8.4 → Task 7. Non-goals are not planned.
- **Types:** `GateDecision`, `calcFee`, `next340bWindow`, `canAdvance`, `recordAudit` are defined once and consumed with matching names.
- **Review Focus:** items 1–2 pinned in Tasks 3–4, 3–4 in Tasks 6 and 11, 5 in Tasks 6 and 10.
