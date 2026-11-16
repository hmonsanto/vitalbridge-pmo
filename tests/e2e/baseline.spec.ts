import { test, expect, type Page } from "@playwright/test";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

const DEMO_A = "/hospitals/00000000-0000-0000-0000-0000000000b1";

async function newHospital(page: Page) {
  await page.goto("/hospitals/new");
  await page.getByLabel("Name").fill(`E2E Baseline ${Date.now()}`);
  await page.getByLabel("Scenario").selectOption("A");
  await page.getByRole("button", { name: "Create hospital" }).click();
  await expect(page).toHaveURL(/\/hospitals\/[0-9a-f-]{36}$/);
}

async function addEntry(page: Page, month: string, baseline: string, actual: string) {
  await page.getByLabel("Month").fill(month);
  await page.getByLabel("Baseline ($)").fill(baseline);
  await page.getByLabel("Actual ($)").fill(actual);
  await page.getByRole("button", { name: "Add entry" }).click();
}

test.describe("owner", () => {
  test.use({ storageState: OWNER_STATE });

  test("a hospital with no entries shows an empty state and a $0.00 fee", async ({ page }) => {
    await newHospital(page);
    await expect(page.getByText("No baseline entries yet")).toBeVisible();
    await expect(page.getByTestId("fee")).toHaveText("$0.00");
  });

  test("baseline 100 and actual 140 gives incremental $40.00 and fee $12.00", async ({ page }) => {
    await newHospital(page);
    await addEntry(page, "2027-01", "100", "140");
    await expect(page.getByTestId("incremental")).toHaveText("$40.00");
    await expect(page.getByTestId("fee")).toHaveText("$12.00");
  });

  test("a month below baseline owes nothing and does not reduce the fee", async ({ page }) => {
    await newHospital(page);
    await addEntry(page, "2027-01", "100", "140");
    await expect(page.getByTestId("fee")).toHaveText("$12.00");
    await addEntry(page, "2027-02", "100", "60");
    await expect(page.getByRole("cell", { name: "2027-02", exact: true })).toBeVisible();
    await expect(page.getByTestId("fee")).toHaveText("$12.00");
  });

  test("a duplicate month is rejected with a message", async ({ page }) => {
    await newHospital(page);
    await addEntry(page, "2027-01", "100", "140");
    await expect(page.getByRole("cell", { name: "2027-01", exact: true })).toBeVisible();
    await addEntry(page, "2027-01", "100", "150");
    await expect(page.getByText("That month already has an entry")).toBeVisible();
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees the seeded fee but cannot add entries", async ({ page }) => {
    await page.goto(DEMO_A);
    await expect(page.getByTestId("fee")).toHaveText("$3,600.00");
    await expect(page.getByRole("button", { name: "Add entry" })).toHaveCount(0);
  });
});
