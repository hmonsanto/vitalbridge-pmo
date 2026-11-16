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
