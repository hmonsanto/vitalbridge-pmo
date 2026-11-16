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
| 14 | Document links cannot carry script URLs | `src/lib/url.ts` (`isHttpUrl`) enforced in `deliverableSchema` and again when rendering. Test: `tests/validation.test.ts` "deliverableSchema doc_url" |
| 15 | Dependency audit | `npm audit`: 0 high or critical; 0 in production dependencies; 7 moderate findings, all in the ESLint/TypeScript dev toolchain (not shipped) |

## Known limitations (accepted for version 1)

- The login rate limiter is in memory, so it resets on restart and is per server instance. Adequate for two users; replace with a shared store if the app scales out.
- The CSP allows inline scripts because Next.js needs them for its bootstrap. A nonce-based CSP would be stricter.
- Meeting times entered in the form are interpreted in the server's time zone.
- Supabase's own sign-in endpoint is not covered by the app's rate limiter; rely on Supabase's built-in auth rate limits.
- The audit log records successful sign-ins and writes, not failed sign-in attempts.
- Pages verify the session by checking the JWT locally instead of asking the Auth server on every request. This is faster, but a session revoked elsewhere (for example, signing out on another device) stays valid here until the access token expires (1 hour by default). Writes remain protected by RLS and the MFA gate.
