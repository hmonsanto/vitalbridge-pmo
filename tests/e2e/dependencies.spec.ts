import { test, expect } from "@playwright/test";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

const DEMO_A = "/hospitals/00000000-0000-0000-0000-0000000000b1";

test.describe("owner", () => {
  test.use({ storageState: OWNER_STATE });

  test("flags the seeded past-due dependency as overdue", async ({ page }) => {
    await page.goto(DEMO_A);
    const row = page.getByRole("listitem").filter({ hasText: "DEA registration" });
    await expect(row.getByText("Overdue")).toBeVisible();
  });

  test("adds a risk and a dependency", async ({ page }) => {
    const risk = `E2E risk ${Date.now()}`;
    const dep = `E2E dependency ${Date.now()}`;
    await page.goto(DEMO_A);

    await page.getByLabel("Risk title").fill(risk);
    await page.getByLabel("Severity").selectOption("high");
    await page.getByRole("button", { name: "Add risk" }).click();
    await expect(page.getByText(risk)).toBeVisible();

    await page.getByLabel("Dependency title").fill(dep);
    await page.getByLabel("Type").selectOption("license");
    await page.getByLabel("Due date").fill("2030-06-01");
    await page.getByRole("button", { name: "Add dependency" }).click();
    await expect(page.getByText(dep)).toBeVisible();
  });

  test("marking a dependency done removes its overdue flag", async ({ page }) => {
    const dep = `E2E past ${Date.now()}`;
    await page.goto(DEMO_A);
    await page.getByLabel("Dependency title").fill(dep);
    await page.getByLabel("Type").selectOption("other");
    await page.getByLabel("Due date").fill("2020-01-01");
    await page.getByRole("button", { name: "Add dependency" }).click();
    const row = page.getByRole("listitem").filter({ hasText: dep });
    await expect(row.getByText("Overdue")).toBeVisible();
    await row.getByRole("button", { name: "Mark done" }).click();
    await expect(row.getByText("Overdue")).toHaveCount(0);
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees risks and dependencies without add forms", async ({ page }) => {
    await page.goto(DEMO_A);
    await expect(page.getByText("Hospital finances unstable")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add risk" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add dependency" })).toHaveCount(0);
  });
});

test.describe("calendar", () => {
  test.use({ storageState: VIEWER_STATE });

  test("shows the 340B window and upcoming dependency deadlines", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByText("340B registration window")).toBeVisible();
    await expect(page.getByText(/Open now|Opens/)).toBeVisible();
    await expect(page.getByText("340B enrollment")).toBeVisible();
  });
});
