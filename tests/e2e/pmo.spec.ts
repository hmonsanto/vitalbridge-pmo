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

});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees the PMO gates without edit controls", async ({ page }) => {
    await page.goto("/pmo");
    await expect(page.getByTestId("gate-G1")).toBeVisible();
    await expect(page.getByRole("button", { name: "Record decision" })).toHaveCount(0);
  });
});
