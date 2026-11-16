import { test, expect } from "@playwright/test";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

test.describe("owner", () => {
  test.use({ storageState: OWNER_STATE });

  test("PMO page lists gates G0 to G5 and records a decision", async ({ page }) => {
    await page.goto("/pmo");
    for (const code of ["G0", "G1", "G2", "G3", "G4", "G5"]) {
      await expect(page.getByTestId(`gate-${code}`)).toBeVisible();
    }
    await page.getByLabel("Gate", { exact: true }).selectOption("G0");
    await page.getByLabel("Decision").selectOption("go_with_conditions");
    await page.getByRole("button", { name: "Record decision" }).click();
    await expect(page.getByTestId("gate-G0")).toContainText("Go with conditions");
  });

  test("adds and completes a to-do", async ({ page }) => {
    const title = `E2E todo ${Date.now()}`;
    await page.goto("/todos");
    await page.getByLabel("To-do title").fill(title);
    await page.getByRole("button", { name: "Add to-do" }).click();
    const row = page.getByRole("listitem").filter({ hasText: title });
    await expect(row).toBeVisible();
    await row.getByRole("checkbox").check();
    await expect(row.getByRole("checkbox")).toBeChecked();
  });

  test("adds a meeting", async ({ page }) => {
    const title = `E2E meeting ${Date.now()}`;
    await page.goto("/todos");
    await page.getByLabel("Meeting title").fill(title);
    await page.getByLabel("Starts at").fill("2030-03-01T10:00");
    await page.getByRole("button", { name: "Add meeting" }).click();
    await expect(page.getByText(title)).toBeVisible();
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees the PMO gates and to-dos without edit controls", async ({ page }) => {
    await page.goto("/pmo");
    await expect(page.getByTestId("gate-G1")).toBeVisible();
    await expect(page.getByRole("button", { name: "Record decision" })).toHaveCount(0);

    await page.goto("/todos");
    await expect(page.getByText("Session with the sponsor")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to-do" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add meeting" })).toHaveCount(0);
  });
});
