# VitalBridge RX PMO Dashboard — Design

Date: 2026-11-15 · Status: draft for approval · Owner: Henry (Project Manager / PMO lead)

## 1. Intent

Henry is the Project Manager and PMO lead at VitalBridge RX, a company that rescues and operates outpatient pharmacies of struggling hospitals. He has not started yet (planned start 2026-11-30) and wants one secure, intuitive, animated "single pane of glass" to run his hospital projects and the PMO build-out, instead of jumping between Asana, Excel, Word and calendars.

The visual concept comes from a LinkedIn "PM ONE Dashboard" mock-up (To-Do, today's meetings, major issues, requirements table, project tabs, voice assistant). It is adapted to VitalBridge's real way of working, which differs from that software-oriented mock-up (see source documents in `Desktop/VitalBridge RX/English`).

Users: Henry first (owner). Ned Mahic (company lead) later, read-only.

## 2. Context that shapes the design (from the company documents)

- Method is **waterfall with decision gates**: 6 phases, gates G1–G5 per hospital project; the PMO build has its own gates G0–G5.
- Each hospital is classified as **scenario A** (has pharmacy), **B** (program, no pharmacy) or **C** (from scratch). Scenario changes scope, not stages.
- **External dependencies** (licenses, DEA, 340B enrollment, payer contracts) run on third-party calendars. 340B registration windows: 1st–15th of Jan, Apr, Jul, Oct.
- Revenue model: 30% of incremental gross profit over an agreed **baseline**, reconciled monthly. The baseline is the highest-value deliverable.
- Target work tool is Asana; Jira/Teams are not part of Henry's stack as documented.

## 3. Goals

1. One screen answering "are we on track?" per hospital and across the portfolio.
2. Track phases, gates (Go / Go with conditions / Re-plan / Stop), deliverables, risks and external dependencies with due dates.
3. Show baseline vs actual margin and the resulting fee estimate per hospital.
4. Login with roles: Henry edits everything; Ned only views.
5. Polished animated UI that is fast to scan.

## 4. Non-goals (version 1)

- Jira, Teams, Outlook or Asana integrations (Asana sync is the first later candidate).
- Voice assistant / AI commands (later phase).
- PPT/Excel export (candidate for v1.1).
- Patient data of any kind.

## 5. Anti-goals

- Becoming more upkeep than the Excel it replaces: data entry must be quick.
- Any path where a viewer can change data, or an unauthenticated visitor can read data.
- Decorative animation that slows scanning or hides information.

## 6. Constraints

- Stack chosen by Henry: **Next.js (React, TypeScript) + Supabase** (Postgres, Auth, Row Level Security). Hosted web app, reachable by URL.
- Data is confidential commercial and financial information. Assumption: no patient data (to be confirmed with Henry).
- UI and code in English; conversation in Spanish.
- Dev machine is Windows; the project folder is not yet a git repository.

## 7. Approaches considered

| | Trade-offs | Outcome |
|---|---|---|
| A. Next.js + Supabase | Auth, MFA, password recovery and DB-level security come ready. External service holds the data. Free tier at the start. | **Chosen by Henry** |
| B. Next.js + self-hosted Postgres, hand-built login | Full control of where data lives. Auth code (hashing, sessions, CSRF, throttling, recovery) must be written and maintained; higher risk, slower. | Rejected |

## 8. Decided design

### 8.1 Modules (v1)
- **Portfolio home:** KPI strip (hospitals, gates pending, open risks, overdue dependencies), today's items, major risks.
- **Hospital workspace (one tab per hospital):** scenario badge, 6-phase stepper with gates, deliverables table (owner, status, document link, remarks), risks and external dependencies.
- **Baseline & fee panel:** monthly baseline, actual, incremental gross profit, 30% fee estimate, small trend chart.
- **PMO workstream:** the PMO build plan (G0–G5) tracked as its own project.
- **To-Do and meetings:** Henry's tasks; meetings entered manually.
- **Dependency calendar:** external deadlines, including the quarterly 340B windows.

### 8.2 Data model (tables)
`profiles` (role: owner | viewer), `projects` (hospital, scenario, current phase), `phases`, `gates` (decision, date, notes), `deliverables`, `risks`, `dependencies` (type, due date, window), `baseline_entries` (month, baseline, actual), `todos`, `meetings`, `audit_log`.

### 8.3 Security
- Supabase Auth, email + password, **no public sign-up** (accounts created by invitation only).
- **TOTP multi-factor** required for the owner account; offered to Ned.
- **Row Level Security on every table:** owner full access; viewer `SELECT` only; anonymous nothing. Enforced in the database, not only in the UI.
- Session via `@supabase/ssr` httpOnly secure cookies; middleware blocks all routes except login.
- Service-role key never reaches the browser; secrets only in environment variables, never committed.
- Input validation with schemas on every write; strict security headers and CSP; rate limiting on login.
- Audit log of writes and sign-ins; HTTPS only; backup and restore procedure documented.
- Pre-release security review (RLS tests that prove a viewer cannot write and anonymous cannot read).

### 8.4 Look and motion
Glass-style light theme inspired by the mock-up, with dark mode. Framer Motion for page transitions, card entrance, stepper progress and number count-ups; honors `prefers-reduced-motion`. Responsive, desktop first.

## 9. My calls (Henry may correct)

- Roles limited to owner and viewer in v1.
- Hospital-centric structure (project = hospital), scenario required at creation.
- Manual data entry first; Asana sync later.
- Framer Motion and a light/dark glass theme.
- English UI copy.

## 10. Left to the builder

Component library and chart library choice, exact layout and spacing, seed data, test tooling, folder structure, deployment target (Vercel is the default candidate).
