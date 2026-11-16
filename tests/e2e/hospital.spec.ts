import { test, expect } from "@playwright/test";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

const DEMO_A = "/hospitals/00000000-0000-0000-0000-0000000000b1";

test.describe("owner", () => {
  test.use({ storageState: OWNER_STATE });

  test("creating a hospital without a scenario shows a validation error", async ({ page }) => {
    await page.goto("/hospitals/new");
    await page.getByLabel("Name").fill("No Scenario Hospital");
    await page.getByRole("button", { name: "Create hospital" }).click();
    await expect(page.getByText("Select a scenario")).toBeVisible();
  });

  test("creates a scenario C hospital, then a Go decision advances the phase", async ({ page }) => {
    const name = `E2E Hospital ${Date.now()}`;
    await page.goto("/hospitals/new");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Scenario").selectOption("C");
    await page.getByRole("button", { name: "Create hospital" }).click();

    await expect(page).toHaveURL(/\/hospitals\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByText("Scenario C")).toBeVisible();
    await expect(page.locator('li[data-state="current"]')).toContainText("1.");

    await page.getByLabel("Decision").selectOption("go");
    await page.getByRole("button", { name: "Record decision" }).click();
    await expect(page.locator('li[data-state="current"]')).toContainText("2.");
    await expect(page.locator('li[data-state="complete"]')).toHaveCount(1);

    await page.goto("/hospitals");
    await expect(page.getByText(name)).toBeVisible();
  });

  test("a Stop decision does not advance the phase", async ({ page }) => {
    await page.goto("/hospitals/new");
    await page.getByLabel("Name").fill(`E2E Stop ${Date.now()}`);
    await page.getByLabel("Scenario").selectOption("A");
    await page.getByRole("button", { name: "Create hospital" }).click();
    await page.getByLabel("Decision").selectOption("stop");
    await page.getByRole("button", { name: "Record decision" }).click();
    await expect(page.locator('li[data-state="current"]')).toContainText("1.");
  });

  test("adds a deliverable to the seeded hospital", async ({ page }) => {
    const name = `E2E deliverable ${Date.now()}`;
    await page.goto(DEMO_A);
    await page.getByLabel("Deliverable name").fill(name);
    await page.getByLabel("Phase", { exact: true }).selectOption("3");
    await page.getByRole("button", { name: "Add deliverable" }).click();
    await expect(page.getByRole("cell", { name })).toBeVisible();
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees the hospital but gets no edit controls", async ({ page }) => {
    await page.goto(DEMO_A);
    await expect(page.getByRole("heading", { name: "Demo Hospital A" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Handover summary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add deliverable" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Record decision" })).toHaveCount(0);
  });

  test("cannot open the create form", async ({ page }) => {
    await page.goto("/hospitals/new");
    await expect(page).toHaveURL(/\/hospitals$/);
  });
});
