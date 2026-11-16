import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as OTPAuth from "otpauth";
import { OWNER_STATE } from "./global-setup";

const URL = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MAIL = "http://127.0.0.1:55324"; // local mail catcher (Mailpit)
const OLD_PW = () => process.env.E2E_PASSWORD!;
const NEW_PW = "a-brand-new-passphrase-42";

const admin = () => createClient(URL(), process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const anonClient = () => createClient(URL(), ANON(), { auth: { persistSession: false } });
const totp = (secret: string) => new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 }).generate();

/** A throwaway user, so these tests never touch the shared owner and viewer accounts. */
async function newUser(prefix: string, opts: { owner?: boolean } = {}) {
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@test.local`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: OLD_PW(), email_confirm: true });
  if (error || !data.user) throw error ?? new Error("createUser failed");
  if (opts.owner) await admin().from("profiles").update({ role: "owner" }).eq("id", data.user.id);
  return { email, id: data.user.id };
}

/** Enrols a TOTP factor through the API and returns a client that already passed it (aal2). */
async function enrollTotp(email: string, password: string) {
  const client: SupabaseClient = anonClient();
  await client.auth.signInWithPassword({ email, password });
  const { data } = await client.auth.mfa.enroll({ factorType: "totp" });
  const secret = data!.totp.secret;
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId: data!.id, code: totp(secret) });
  expect(error).toBeNull();
  return { client, secret };
}

/** Reads the password-reset link out of the local mail catcher. */
async function resetLink(email: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const found = (await (await fetch(`${MAIL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json()) as {
      messages?: { ID: string }[];
    };
    if (found.messages?.length) {
      const msg = (await (await fetch(`${MAIL}/api/v1/message/${found.messages[0].ID}`)).json()) as {
        HTML: string;
        Text: string;
      };
      const match = /auth\/confirm\?token_hash=([\w-]+)&(?:amp;)?type=recovery/.exec(`${msg.HTML}${msg.Text}`);
      if (match) return `/auth/confirm?token_hash=${match[1]}&type=recovery`;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("no reset email arrived");
}

/** Next.js adds its own invisible role="alert" route announcer, so alerts are matched by their text. */
const alertWith = (page: Page, text: string) => page.getByRole("alert").filter({ hasText: text });

async function requestReset(page: Page, email: string) {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account exists");
}

async function signInWithUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.describe("forgotten password", () => {
  test("a reset link lets the user choose a new password, and the old one stops working", async ({ page }) => {
    const { email } = await newUser("reset");
    await requestReset(page, email);

    await page.goto(await resetLink(email));
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    await page.getByLabel("New password", { exact: true }).fill(NEW_PW);
    await page.getByLabel("Confirm new password").fill(NEW_PW);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page).toHaveURL("/");

    expect((await anonClient().auth.signInWithPassword({ email, password: NEW_PW })).error).toBeNull();
    expect((await anonClient().auth.signInWithPassword({ email, password: OLD_PW() })).error).not.toBeNull();
  });

  test("an unknown email gets exactly the same answer, so accounts cannot be probed", async ({ page }) => {
    await requestReset(page, `nobody-${Date.now()}@test.local`);
  });

  test("a short or mismatched password is refused", async ({ page }) => {
    const { email } = await newUser("weak");
    await requestReset(page, email);
    await page.goto(await resetLink(email));
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("New password", { exact: true }).fill("short");
    await page.getByLabel("Confirm new password").fill("short");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(alertWith(page, "between 12 and 72")).toBeVisible();

    await page.getByLabel("New password", { exact: true }).fill(NEW_PW);
    await page.getByLabel("Confirm new password").fill(`${NEW_PW}-different`);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(alertWith(page, "do not match")).toBeVisible();
  });

  test("a link works only once", async ({ page }) => {
    const { email } = await newUser("once");
    await requestReset(page, email);
    const link = await resetLink(email);

    await page.goto(link);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    await page.context().clearCookies();

    await page.goto(link);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(alertWith(page, "invalid or has expired")).toBeVisible();
  });

  test("with two-step verification on, the authenticator code comes before the new password", async ({ page }) => {
    const { email } = await newUser("resetmfa");
    const { secret } = await enrollTotp(email, OLD_PW());
    await requestReset(page, email);

    await page.goto(await resetLink(email));
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Confirm it's you" })).toBeVisible();
    await expect(page.getByLabel("New password", { exact: true })).toHaveCount(0);

    await page.getByLabel("Code").fill(totp(secret));
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    await page.getByLabel("New password", { exact: true }).fill(NEW_PW);
    await page.getByLabel("Confirm new password").fill(NEW_PW);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page).toHaveURL("/");
    expect((await anonClient().auth.signInWithPassword({ email, password: NEW_PW })).error).toBeNull();
  });
});

test.describe("lost authenticator", () => {
  test("a recovery code removes the lost authenticator, can be used once, and leads to a new enrolment", async ({ page }) => {
    const { email } = await newUser("lost", { owner: true });
    const { client } = await enrollTotp(email, OLD_PW());
    const { data: codes, error } = await client.rpc("generate_recovery_codes");
    expect(error).toBeNull();
    expect(codes).toHaveLength(10);

    await signInWithUi(page, email, OLD_PW());
    await expect(page).toHaveURL(/\/mfa$/);

    await page.getByRole("button", { name: "Lost your authenticator? Use a recovery code" }).click();
    await page.getByLabel("Recovery code").fill("0000-0000-0000");
    await page.getByRole("button", { name: "Use recovery code" }).click();
    await expect(alertWith(page, "Invalid or already used code")).toBeVisible();

    await page.getByLabel("Recovery code").fill(codes![0]);
    await page.getByRole("button", { name: "Use recovery code" }).click();
    await expect(page).toHaveURL(/\/login\?recovered=1$/);
    await expect(page.getByRole("status")).toContainText("authenticator was removed");

    // Back in: the factor is gone, so the user is asked to enrol a new one.
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(OLD_PW());
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Scan this QR code")).toBeVisible();

    // The same code is dead, and so are the other nine.
    const again = anonClient();
    await again.auth.signInWithPassword({ email, password: OLD_PW() });
    expect((await again.rpc("use_recovery_code", { code: codes![0] })).data).toBe(false);
    expect((await again.rpc("use_recovery_code", { code: codes![1] })).data).toBe(false);
  });

  test("enrolling an authenticator shows ten recovery codes once", async ({ page }) => {
    const { email } = await newUser("enrol", { owner: true });
    await signInWithUi(page, email, OLD_PW());
    await expect(page).toHaveURL(/\/mfa$/);

    const secret = (await page.getByText(/^Secret: /).innerText()).replace("Secret: ", "").trim();
    await page.getByLabel("Code").fill(totp(secret));
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByRole("heading", { name: "Save your recovery codes" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Recovery codes" }).getByRole("listitem")).toHaveCount(10);
    await page.getByRole("button", { name: "I have saved my codes" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/account");
    await expect(page.getByTestId("codes-remaining")).toHaveText("10");
  });
});

test.describe("account page", () => {
  test.describe("owner", () => {
    test.use({ storageState: OWNER_STATE });

    test("generates recovery codes and replaces them on regeneration", async ({ page }) => {
      await page.goto("/account");
      await page.getByRole("button", { name: "Generate new recovery codes" }).click();
      const list = page.getByRole("list", { name: "Recovery codes" });
      await expect(list.getByRole("listitem")).toHaveCount(10);
      const first = await list.getByRole("listitem").first().innerText();
      await page.getByRole("button", { name: "I have saved my codes" }).click();
      await expect(page.getByTestId("codes-remaining")).toHaveText("10");

      await page.getByRole("button", { name: "Generate new recovery codes" }).click();
      await expect(list.getByRole("listitem")).toHaveCount(10);
      expect(await list.getByRole("listitem").first().innerText()).not.toBe(first);
    });
  });

  test("a user changes their own password after proving the current one", async ({ page }) => {
    const { email } = await newUser("change");
    await signInWithUi(page, email, OLD_PW());
    await expect(page).toHaveURL("/");
    await page.goto("/account");

    await page.getByLabel("Current password").fill("not-my-password");
    await page.getByLabel("New password", { exact: true }).fill(NEW_PW);
    await page.getByLabel("Confirm new password").fill(NEW_PW);
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(alertWith(page, "current password")).toBeVisible();

    // React clears the form after each submission, so every field is filled again.
    await page.getByLabel("Current password").fill(OLD_PW());
    await page.getByLabel("New password", { exact: true }).fill(NEW_PW);
    await page.getByLabel("Confirm new password").fill(NEW_PW);
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByRole("status")).toContainText("Password changed");
    expect((await anonClient().auth.signInWithPassword({ email, password: NEW_PW })).error).toBeNull();
    expect((await anonClient().auth.signInWithPassword({ email, password: OLD_PW() })).error).not.toBeNull();

    // Viewers have no second factor, so there is nothing to generate codes for.
    await expect(page.getByRole("button", { name: "Generate new recovery codes" })).toHaveCount(0);
  });
});
