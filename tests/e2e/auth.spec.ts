import { test, expect } from "@playwright/test";
import { OWNER_EMAIL, VIEWER_EMAIL } from "./global-setup";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("unauthenticated visit to / lands on /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("wrong password shows a generic error", async ({ page }) => {
  await login(page, VIEWER_EMAIL, "definitely-wrong");
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});

test("unknown email shows the same generic error", async ({ page }) => {
  await login(page, "nobody@test.local", "definitely-wrong");
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});

test("there is no sign-up route", async ({ page }) => {
  const res = await page.goto("/signup");
  expect(res?.status()).toBe(404);
});

test("viewer signs in and reaches the dashboard", async ({ page }) => {
  await login(page, VIEWER_EMAIL, process.env.E2E_PASSWORD!);
  await expect(page).toHaveURL("/");
});

test("owner without aal2 is redirected to /mfa", async ({ page }) => {
  await login(page, OWNER_EMAIL, process.env.E2E_PASSWORD!);
  await expect(page).toHaveURL(/\/mfa$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/mfa$/);
});

import { createClient } from "@supabase/supabase-js";

test("sign-in writes an audit entry for that user", async ({ page }) => {
  await login(page, VIEWER_EMAIL, process.env.E2E_PASSWORD!);
  await expect(page).toHaveURL("/");

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 200 });
  const viewer = users!.users.find((u) => u.email === VIEWER_EMAIL)!;
  const { data } = await admin.from("audit_log").select("action").eq("actor", viewer.id).eq("action", "sign_in");
  expect(data?.length).toBeGreaterThanOrEqual(1);
});

import * as OTPAuth from "otpauth";

test("a viewer who enrolled TOTP must pass MFA too", async ({ page }) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const email = `viewer-mfa-${Date.now()}@test.local`;
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.createUser({ email, password: process.env.E2E_PASSWORD!, email_confirm: true });
  expect(error).toBeNull();

  // Enroll a TOTP factor for this viewer through the API.
  const user = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  await user.auth.signInWithPassword({ email, password: process.env.E2E_PASSWORD! });
  const { data: enrolled } = await user.auth.mfa.enroll({ factorType: "totp" });
  const code = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(enrolled!.totp.secret), digits: 6, period: 30 }).generate();
  const { error: verifyError } = await user.auth.mfa.challengeAndVerify({ factorId: enrolled!.id, code });
  expect(verifyError).toBeNull();

  // Password alone must no longer be enough.
  await login(page, email, process.env.E2E_PASSWORD!);
  await expect(page).toHaveURL(/\/mfa$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/mfa$/);
});
