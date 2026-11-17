import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

const menuButton = (page: Page) => page.getByRole("button", { name: /^Account menu for/ });
const alertWith = (page: Page, text: string) => page.getByRole("alert").filter({ hasText: text });

test.describe("owner", () => {
  test.use({ storageState: OWNER_STATE });

  // These run in order: the first sees the fallback name, the second sets a real one.
  test("shows who is signed in, using the start of the email until a name is set", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("user-name")).toHaveText("owner-e2e");
    await expect(page.getByTestId("user-role")).toHaveText("Owner");
    await expect(page.getByTestId("welcome")).toHaveText("Welcome, owner-e2e");
    await expect(page.getByRole("link", { name: "Add your name" })).toBeVisible();
  });

  test("saving a display name updates the menu and the greeting", async ({ page }) => {
    await page.goto("/account");
    await page.getByLabel("Display name").fill("Henry Monsanto");
    await page.getByRole("button", { name: "Save name" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Name saved" })).toBeVisible();

    await expect(page.getByTestId("user-name")).toHaveText("Henry Monsanto");
    await expect(page.getByTestId("welcome")).toHaveText("Welcome, Henry");
    await expect(page.getByRole("link", { name: "Add your name" })).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("welcome")).toHaveText("Welcome, Henry");
  });

  test("a blank name is refused", async ({ page }) => {
    await page.goto("/account");
    await page.getByLabel("Display name").fill("   ");
    await page.getByRole("button", { name: "Save name" }).click();
    await expect(alertWith(page, "1 to 80 characters")).toBeVisible();
  });

  test("the menu holds Account, the theme switch and Sign out, and Escape closes it", async ({ page }) => {
    await page.goto("/");
    await menuButton(page).click();
    const menu = page.getByRole("menu", { name: "Account menu" });
    await expect(menu.getByRole("menuitem", { name: "Account" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /(Dark|Light) mode/ })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Sign out" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);

    await menuButton(page).click();
    await page.getByRole("menuitem", { name: "Account" }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("the theme is switched from the menu and remembered", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await menuButton(page).click();
    await page.getByRole("menuitem", { name: "Dark mode" }).click();
    await expect(html).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);

    await menuButton(page).click();
    await page.getByRole("menuitem", { name: "Light mode" }).click();
    await expect(html).not.toHaveClass(/\bdark\b/);
  });
});

test.describe("signing out", () => {
  test("Sign out in the menu ends the session and returns to the login", async ({ page }) => {
    // A throwaway account: signing out revokes that user's sessions, so the shared owner must not be used.
    const email = `menu-${Date.now()}@test.local`;
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    await admin.auth.admin.createUser({ email, password: process.env.E2E_PASSWORD!, email_confirm: true });

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");

    await menuButton(page).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees their own role in the menu", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("user-role")).toHaveText("Viewer");
    await expect(page.getByTestId("welcome")).toContainText("Welcome, viewer-e2e");
  });
});
