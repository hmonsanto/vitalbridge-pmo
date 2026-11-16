import { randomUUID } from "node:crypto";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as OTPAuth from "otpauth";

export const OWNER_EMAIL = "owner-e2e@test.local";
export const VIEWER_EMAIL = "viewer-e2e@test.local";
export const OWNER_STATE = "tests/e2e/.auth/owner.json";
export const VIEWER_STATE = "tests/e2e/.auth/viewer.json";
const BASE_URL = "http://127.0.0.1:3100";

export default async function globalSetup() {
  const password = `Pw-${randomUUID()}`;
  process.env.E2E_PASSWORD = password;

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of existing?.users ?? []) {
    if (u.email === OWNER_EMAIL || u.email === VIEWER_EMAIL) await admin.auth.admin.deleteUser(u.id);
  }

  for (const email of [OWNER_EMAIL, VIEWER_EMAIL]) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    if (email === OWNER_EMAIL) {
      await admin.from("profiles").update({ role: "owner" }).eq("id", data.user.id);
    }
  }

  // Pre-authenticated browser states so feature specs do not repeat the login/MFA flow.
  const browser = await chromium.launch();
  try {
    const viewerCtx = await browser.newContext({ baseURL: BASE_URL });
    const vp = await viewerCtx.newPage();
    await signIn(vp, VIEWER_EMAIL, password);
    await vp.waitForURL(`${BASE_URL}/`);
    await viewerCtx.storageState({ path: VIEWER_STATE });

    const ownerCtx = await browser.newContext({ baseURL: BASE_URL });
    const op = await ownerCtx.newPage();
    await signIn(op, OWNER_EMAIL, password);
    await op.waitForURL(/\/mfa$/);
    const secretText = await op.getByText(/^Secret: /).innerText();
    const secret = secretText.replace("Secret: ", "").trim();
    const code = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 }).generate();
    await op.getByLabel("Code").fill(code);
    await op.getByRole("button", { name: "Verify" }).click();
    // First-time enrolment now shows the recovery codes once; confirm like a person would.
    await op.getByRole("button", { name: "I have saved my codes" }).click();
    await op.waitForURL(`${BASE_URL}/`);
    await ownerCtx.storageState({ path: OWNER_STATE });
  } finally {
    await browser.close();
  }
}

async function signIn(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
