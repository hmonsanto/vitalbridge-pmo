# Deployment guide

Target: Next.js on Vercel, data and auth on a hosted Supabase project.

## 1. Create the Supabase project

1. Create a project at supabase.com. Choose a strong database password and store it in your password manager.
2. Link and push the schema from this repository:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   This applies `supabase/migrations/0001_schema.sql` and `0002_rls.sql`. Do **not** run `supabase/seed.sql` in production: it contains demo data.
3. In **Authentication > Providers > Email**: turn **off** "Allow new users to sign up" (sign-up must stay invitation-only) and keep email confirmation on.
4. In **Authentication > Multi-Factor**: enable TOTP enrollment and verification.
5. In **Authentication > URL configuration**: set the Site URL to your production domain.

## 2. Create the two users

Users are created by invitation only (Authentication > Users > Invite user), never by self sign-up.

1. Invite the owner (Henry) and the viewer (Ned). Each starts with role `viewer` (a database trigger creates the profile).
2. Promote the owner once, in the SQL editor:

   ```sql
   update public.profiles set role = 'owner'
   where id = (select id from auth.users where email = 'OWNER_EMAIL_HERE');
   ```

   Roles cannot be changed through the app or the API by anyone, by design.
3. The owner is forced to enroll an authenticator app (TOTP) on first sign-in.

## 3. Environment variables (Vercel > Settings > Environment Variables)

| Name | Value | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | Public (safe: RLS enforces access) |

The service-role key is **not needed by the app** and must not be added to Vercel. It is used only by local test setup (`.env.local`, git-ignored).

## 4. Deploy

Connect the repository to Vercel and deploy. Vercel serves HTTPS only; the app also sends `Strict-Transport-Security`. After deploying, open the production URL and confirm: you are redirected to `/login`, `/signup` returns 404, and the owner is sent to `/mfa` after signing in.

## 5. Backups and restore

- Supabase Pro plans include daily backups; on the free plan there are none. Until you upgrade, take a manual dump regularly:

  ```bash
  npx supabase db dump --linked -f backup-$(date +%F).sql
  ```

- Store dumps encrypted and outside the repository (they contain confidential commercial data).
- Restore into a fresh project by applying the migrations, then loading the data-only dump:

  ```bash
  npx supabase db dump --linked --data-only -f data.sql   # taking the dump
  psql "<target connection string>" -f data.sql           # restoring it
  ```

- Practice one restore into a scratch project before relying on it.

## 6. Password and MFA recovery (one-time setup per Supabase project)

The app has "Forgot password", an Account page and MFA recovery codes. They need the following in the Supabase project.
Do these **before** relying on them in production.

1. **Apply the new migration** (creates the recovery-code tables and functions). From the project folder:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push --remote --dry-run   # must list 0003_mfa_recovery.sql only
   npx supabase db push --remote
   ```

2. **Reset-password email template.** In **Authentication > Emails > Templates > Reset Password**, set the subject to
   `Reset your VitalBridge RX PMO password` and paste the body from `supabase/templates/recovery.html`. The link in it
   **must** be exactly `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`: the default template links to
   a different address that this app does not use.
3. **Site URL.** In **Authentication > URL Configuration**, the Site URL must be the production address
   (`https://vitalbridge-pmo.vercel.app`). The emailed link is built from it.
4. **Password length.** In **Authentication > Sign In / Providers > Email**, set **Minimum password length** to `12`
   (the app already enforces 12 to 72 characters; this makes Supabase agree).
5. **Email delivery.** Supabase's built-in mail service delivers **only to members of your Supabase organization** and allows
   a few messages per hour. That is enough for the owner. For anyone else (Ned), set up your own SMTP provider in
   **Authentication > Emails > SMTP Settings** (for example Resend or Amazon SES) and verify the sending domain.
6. **Try it.** Sign out, use "Forgot password?" with your own email, and complete the reset. Then sign in, open
   **Account**, and generate your recovery codes. Store them in your password manager.

## 7. Local development

```bash
npx supabase start                                        # needs Docker Desktop
powershell -ExecutionPolicy Bypass -File scripts/setup-env.ps1   # writes .env.local
npm run dev
```

Local Supabase ports are 55321 to 55329 (moved from the default 543xx range to avoid clashes with other projects).

Test commands: `npm test` (unit), `npx supabase test db` (database and RLS), `npm run test:e2e` (browser; starts its own dev server on port 3100).
