# Security checklist

Evidence for every item in section 8.3 of the design (`docs/superpowers/specs/2026-11-15-pmo-dashboard-design.md`). "Test" names files in `tests/` or `supabase/tests/`.

| # | Requirement | Evidence |
|---|---|---|
| 1 | Email + password via Supabase Auth, no public sign-up | `supabase/config.toml` `enable_signup = false`. Test: `e2e/security.spec.ts` "public sign-up is disabled at the auth API" (asserts `signup_disabled`); `e2e/auth.spec.ts` "there is no sign-up route" |
| 2 | Accounts by invitation only | No sign-up route or form exists in `src/app`; process in `docs/deployment.md` section 2 |
| 3 | TOTP MFA required for the owner, and for any user who enrolls a factor | `src/lib/supabase/proxy-session.ts` redirects an owner without `aal2` to `/mfa`. Test: `e2e/auth.spec.ts` "owner without aal2 is redirected to /mfa"; `e2e/auth.spec.ts` "a viewer who enrolled TOTP must pass MFA too"; `e2e/global-setup.ts` completes a real TOTP enrollment |
| 4 | Row Level Security on every table: owner full, viewer read-only, anonymous nothing | `supabase/migrations/0002_rls.sql`. Tests: `supabase/tests/rls.test.sql` (16 assertions), `e2e/security.spec.ts` "anonymous API access returns no rows" and "a viewer cannot write through the API directly" |
| 5 | A viewer cannot promote themselves; nobody changes roles through the API | `profiles` has no write policies. Tests: `rls.test.sql` (two assertions), `e2e/security.spec.ts` |
| 6 | httpOnly secure session cookies | `src/lib/supabase/cookie-options.ts` (`secure` in production, `sameSite: lax`); no browser Supabase client exists. Test: `e2e/security.spec.ts` "session cookies are httpOnly" |
| 7 | Service-role key never reaches the browser; secrets only in env vars | Test: `tests/security-static.test.ts` (no reference in `src`, only the two public variables used); `.gitignore` excludes `.env*` except `.env.example` |
| 8 | Input validation on every write | `src/lib/validation.ts` (zod) used by every server action; test: `tests/validation.test.ts` |
| 9 | Security headers and CSP | `src/lib/security-headers.ts`, applied in `next.config.ts`. Tests: `tests/security-headers.test.ts`, `e2e/security.spec.ts` "responses carry the security headers" |
| 10 | Rate limiting on login | `src/lib/rate-limit.ts` applied in `src/app/(auth)/login/actions.ts` (5 attempts per 15 minutes per IP and email). Test: `tests/rate-limit.test.ts` |
| 11 | Audit log of writes and sign-ins | `src/lib/audit.ts`, called from every write action. Test: `e2e/auth.spec.ts` "sign-in writes an audit entry for that user". Only the owner can read it (`rls.test.sql`) |
| 12 | HTTPS only | `Strict-Transport-Security` header; Vercel serves HTTPS only (`docs/deployment.md`) |
| 13 | Backup and restore procedure | `docs/deployment.md` section 5 |
| 16 | Password reset by email cannot be used to probe accounts or to skip the second factor | `src/app/(auth)/forgot-password/actions.ts` always answers the same and is rate limited (3 per 15 minutes per address); the one-time link needs a click on "Continue" (`src/app/auth/confirm`) so mail scanners cannot use it; `src/app/(auth)/reset-password/page.tsx` asks for the authenticator code first when MFA is on and refuses sessions that did not come from the emailed link (`src/lib/recovery-session.ts`). Tests: `e2e/recovery.spec.ts` ("forgotten password"), `tests/domain/recovery-session.test.ts` |
| 17 | MFA recovery codes | `supabase/migrations/0003_mfa_recovery.sql`: codes stored only as bcrypt hashes in tables users cannot read; created only by a session that passed MFA (aal2); one use removes the lost authenticator and invalidates every other code; five wrong guesses in 15 minutes lock further attempts; no service-role key in the app. Tests: `supabase/tests/recovery.test.sql` (17 assertions), `e2e/recovery.spec.ts` ("lost authenticator") |
| 18 | Password policy and change | 12 to 72 characters (`newPasswordSchema`, and `minimum_password_length` in Supabase); changing it from Account needs the current password, checked with a throwaway client so the session keeps its MFA level, is rate limited, and signs out other sessions. Tests: `tests/validation.test.ts`, `e2e/recovery.spec.ts` ("account page") |
| 14a | Edits and deletes are owner-only, scoped and audited | Every update/delete action in `src/app/(app)/hospitals/edit-actions.ts` and `src/app/(app)/todos/actions.ts` checks the owner role, filters by project id, reports zero affected rows as a failure and records an audit entry. RLS enforces it again in the database (`rls.test.sql`; `e2e/security.spec.ts` "a viewer cannot write through the API directly"). Deleting a hospital also requires typing its exact name, checked on the server. Tests: `e2e/edit-delete.spec.ts` |
| 14 | Document links cannot carry script URLs | `src/lib/url.ts` (`isHttpUrl`) enforced in `deliverableSchema` and again when rendering. Test: `tests/validation.test.ts` "deliverableSchema doc_url" |
| 15 | Dependency audit | `npm audit`: 0 high or critical; 0 in production dependencies; 7 moderate findings, all in the ESLint/TypeScript dev toolchain (not shipped) |

## Known limitations (accepted for version 1)

- The login rate limiter is in memory, so it resets on restart and is per server instance. Adequate for two users; replace with a shared store if the app scales out.
- The CSP allows inline scripts because Next.js needs them for its bootstrap. A nonce-based CSP would be stricter.
- Meeting times entered in the form are interpreted in the server's time zone.
- Supabase's own sign-in endpoint is not covered by the app's rate limiter; rely on Supabase's built-in auth rate limits.
- The audit log records successful sign-ins and writes, not failed sign-in attempts.
- A recovery code is 48 bits of randomness. That is strong enough behind the lockout (5 wrong guesses per 15 minutes) and a password already being required, but it is a deliberate trade-off: whoever holds the password plus one unused code can remove the second factor. Keep the codes in a password manager, not in the same place as the password.
- Supabase's built-in email service only delivers to organization members. Password reset for other users needs a custom SMTP provider (see `docs/deployment.md`, section 6).
- The reset and password-change forms are rate limited in memory per server instance, like the login form.
- Pages verify the session by checking the JWT locally instead of asking the Auth server on every request. This is faster, but a session revoked elsewhere (for example, signing out on another device) stays valid here until the access token expires (1 hour by default). Writes remain protected by RLS and the MFA gate.
