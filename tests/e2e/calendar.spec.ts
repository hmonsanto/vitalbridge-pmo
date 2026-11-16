import { test, expect, type Page } from "@playwright/test";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

// A month far in the future with no 340B window (May), so seeded data never lands in it.
const MAY = "/calendar?m=2031-05";
const cell = (page: Page, date: string) => page.locator(`[data-date="${date}"]`);

test.describe("owner", () => {
  test.use({ storageState: OWNER_STATE });

  test("shows the requested month and moves between months", async ({ page }) => {
    await page.goto(MAY);
    await expect(page.getByRole("heading", { name: "May 2031" })).toBeVisible();
    for (const weekday of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      await expect(page.getByText(weekday, { exact: true }).first()).toBeVisible();
    }
    await page.getByRole("link", { name: "Next month" }).click();
    await expect(page).toHaveURL(/m=2031-06/);
    await expect(page.getByRole("heading", { name: "June 2031" })).toBeVisible();
    await page.getByRole("link", { name: "Previous month" }).click();
    await page.getByRole("link", { name: "Previous month" }).click();
    await expect(page.getByRole("heading", { name: "April 2031" })).toBeVisible();
  });

  test("falls back to the current month for an invalid month or day", async ({ page }) => {
    const res = await page.goto("/calendar?m=garbage&d=2031-02-30");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 2, name: /^[A-Z][a-z]+ \d{4}$/ })).toBeVisible();
  });

  test("highlights exactly the 340B window days", async ({ page }) => {
    await page.goto("/calendar?m=2027-01");
    await expect(cell(page, "2027-01-01")).toHaveAttribute("data-340b", "true");
    await expect(cell(page, "2027-01-15")).toHaveAttribute("data-340b", "true");
    await expect(cell(page, "2027-01-16")).not.toHaveAttribute("data-340b", "true");
    await page.goto("/calendar?m=2027-02");
    await expect(cell(page, "2027-02-10")).not.toHaveAttribute("data-340b", "true");
  });

  test("starts the day's date fields on the selected day", async ({ page }) => {
    await page.goto(`${MAY}&d=2031-05-20`);
    await page.getByRole("tab", { name: "To-do" }).click();
    await expect(page.getByLabel("Due date")).toHaveValue("2031-05-20");
    await page.getByRole("tab", { name: "Meeting" }).click();
    await expect(page.getByLabel("Starts at")).toHaveValue("2031-05-20T09:00");
  });

  test("adds a to-do on the selected day", async ({ page }) => {
    const title = `Cal todo ${Date.now()}`;
    await page.goto(`${MAY}&d=2031-05-14`);
    await page.getByRole("tab", { name: "To-do" }).click();
    await page.getByLabel("To-do title").fill(title);
    await page.getByRole("button", { name: "Add to-do" }).click();
    await expect(cell(page, "2031-05-14").locator('[data-kind="todo"]', { hasText: title })).toBeVisible();
  });

  test("adds a meeting on the selected day", async ({ page }) => {
    const title = `Cal meeting ${Date.now()}`;
    await page.goto(`${MAY}&d=2031-05-15`);
    await page.getByLabel("Meeting title").fill(title);
    await page.getByRole("button", { name: "Add meeting" }).click();
    await expect(cell(page, "2031-05-15").locator('[data-kind="meeting"]', { hasText: title })).toBeVisible();
  });

  test("adds a dependency to a hospital from the calendar", async ({ page }) => {
    const title = `Cal dependency ${Date.now()}`;
    await page.goto(`${MAY}&d=2031-05-16`);
    await page.getByRole("tab", { name: "Dependency" }).click();
    await page.getByLabel("Dependency title").fill(title);
    await page.getByLabel("Type").selectOption("dea");
    await page.getByRole("button", { name: "Add dependency" }).click();
    const chip = cell(page, "2031-05-16").locator('[data-kind="dependency"]', { hasText: title });
    await expect(chip).toBeVisible();
    await expect(chip).not.toHaveAttribute("data-overdue", "true");
  });

  test("flags a past-due dependency as overdue", async ({ page }) => {
    const title = `Cal overdue ${Date.now()}`;
    await page.goto("/calendar?m=2020-01&d=2020-01-10");
    await page.getByRole("tab", { name: "Dependency" }).click();
    await page.getByLabel("Dependency title").fill(title);
    await page.getByRole("button", { name: "Add dependency" }).click();
    await expect(cell(page, "2020-01-10").locator('[data-kind="dependency"]', { hasText: title })).toHaveAttribute(
      "data-overdue",
      "true",
    );
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees the calendar but gets no add forms", async ({ page }) => {
    await page.goto(`${MAY}&d=2031-05-14`);
    await expect(page.getByRole("heading", { name: "May 2031" })).toBeVisible();
    await expect(cell(page, "2031-05-14")).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Add to this day" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Add (to-do|meeting|dependency)$/ })).toHaveCount(0);
  });
});
