import { test, expect } from "@playwright/test";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

for (const [role, state] of [["owner", OWNER_STATE], ["viewer", VIEWER_STATE]] as const) {
  test.describe(`${role} portfolio`, () => {
    test.use({ storageState: state });

    test("shows KPIs and the seeded critical risk", async ({ page }) => {
      await page.goto("/");
      const hospitals = page.getByTestId("kpi-hospitals");
      await expect(hospitals).toBeVisible();
      expect(Number(await hospitals.getAttribute("data-value"))).toBeGreaterThanOrEqual(2);
      await expect(page.getByText("Hospital finances unstable")).toBeVisible();
      expect(Number(await page.getByTestId("kpi-overdue").getAttribute("data-value"))).toBeGreaterThanOrEqual(1);
    });
  });
}
