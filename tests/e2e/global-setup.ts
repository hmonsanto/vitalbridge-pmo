import { randomUUID } from "node:crypto";
import { chromium, type Browser, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as OTPAuth from "otpauth";

// "owner" is the admin role in the database; the screens call it Admin.
export const OWNER_EMAIL = "owner-e2e@test.local";
export const EDITOR_EMAIL = "editor-e2e@test.local";
export const VIEWER_EMAIL = "viewer-e2e@test.local";
export const OWNER_STATE = "tests/e2e/.auth/owner.json";
export const EDITOR_STATE = "tests/e2e/.auth/editor.json";
export const VIEWER_STATE = "tests/e2e/.auth/viewer.json";
const BASE_URL = "http://127.0.0.1:3100";

export default async function globalSetup() {
  const password = `Pw-${randomUUID()}`;
  process.env.E2E_PASSWORD = password;

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const wanted = [OWNER_EMAIL, EDITOR_EMAIL, VIEWER_EMAIL];
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of existing?.users ?? []) {
    if (u.email && wanted.includes(u.email)) await admin.auth.admin.deleteUser(u.id);
  }

  for (const email of wanted) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    const role = email === OWNER_EMAIL ? "owner" : email === EDITOR_EMAIL ? "editor" : null;
    if (role) await admin.from("profiles").update({ role }).eq("id", data.user.id);
  }

  // Pre-authenticated browser states so feature specs do not repeat the login/MFA flow.
  const browser = await chromium.launch();
  try {
    await saveViewerState(browser, password);
    await saveMfaState(browser, OWNER_EMAIL, password, OWNER_STATE);
    await saveMfaState(browser, EDITOR_EMAIL, password, EDITOR_STATE);
  } finally {
    await browser.close();
  }
}

async function saveViewerState(browser: Browser, password: string) {
  const ctx = await browser.newContext({ baseURL: BASE_URL });
  const page = await ctx.newPage();
  await signIn(page, VIEWER_EMAIL, password);
  await page.waitForURL(`${BASE_URL}/`);
  await ctx.storageState({ path: VIEWER_STATE });
}

/** Admins and editors must use two-step verification, so their saved state includes a real TOTP sign-in. */
async function saveMfaState(browser: Browser, email: string, password: string, statePath: string) {
  const ctx = await browser.newContext({ baseURL: BASE_URL });
  const page = await ctx.newPage();
  await signIn(page, email, password);
  await page.waitForURL(/\/mfa$/);
  const secretText = await page.getByText(/^Secret: /).innerText();
  const secret = secretText.replace("Secret: ", "").trim();
  const code = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 }).generate();
  await page.getByLabel("Code").fill(code);
  await page.getByRole("button", { name: "Verify" }).click();
  // First-time enrolment shows the recovery codes once; confirm like a person would.
  await page.getByRole("button", { name: "I have saved my codes" }).click();
  await page.waitForURL(`${BASE_URL}/`);
  await ctx.storageState({ path: statePath });
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
