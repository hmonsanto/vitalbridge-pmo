import { test, expect, type Page } from "@playwright/test";
import { OWNER_STATE, VIEWER_STATE } from "./global-setup";

const DEMO_A = "/hospitals/00000000-0000-0000-0000-0000000000b1";
// See calendar.spec.ts: the test database is not reset, so items go in a month no earlier run has used.
const stamp = Math.floor(Date.now() / 60_000);
const RUN_MONTH = String((stamp % 12) + 1).padStart(2, "0");
const FUTURE = `${2100 + (Math.floor(stamp / 12) % 800)}-${RUN_MONTH}`;

async function newHospital(page: Page, name = `Edit ${Date.now()}`) {
  await page.goto("/hospitals/new");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Scenario").selectOption("A");
  await page.getByRole("button", { name: "Create hospital" }).click();
  await expect(page).toHaveURL(/\/hospitals\/[0-9a-f-]{36}$/);
  return name;
}

const dialog = (page: Page) => page.getByRole("dialog");
const confirmDelete = async (page: Page, label: string) => {
  await page.getByRole("button", { name: `Delete ${label}` }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();
};

test.describe("owner edits and deletes", () => {
  test.use({ storageState: OWNER_STATE });

  test("edits a hospital's name and scenario", async ({ page }) => {
    await newHospital(page);
    const renamed = `Renamed ${Date.now()}`;
    await page.getByRole("button", { name: "Edit hospital" }).click();
    await dialog(page).getByLabel("Name").fill(renamed);
    await dialog(page).getByLabel("Scenario").selectOption("B");
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("heading", { name: renamed })).toBeVisible();
    await expect(page.getByText("Scenario B")).toBeVisible();
  });

  test("deleting a hospital requires typing its exact name", async ({ page }) => {
    const name = await newHospital(page);
    await page.getByRole("button", { name: "Delete hospital" }).click();
    await dialog(page).getByLabel("Type the hospital name to confirm").fill("not the name");
    await dialog(page).getByRole("button", { name: "Delete hospital permanently" }).click();
    await expect(dialog(page).getByRole("alert")).toBeVisible();

    await dialog(page).getByLabel("Type the hospital name to confirm").fill(name);
    await dialog(page).getByRole("button", { name: "Delete hospital permanently" }).click();
    await expect(page).toHaveURL(/\/hospitals$/);
    await expect(page.getByRole("navigation", { name: "Hospitals" }).getByRole("link", { name })).toHaveCount(0);
  });

  test("edits a deliverable (link and remarks) and deletes it", async ({ page }) => {
    await newHospital(page);
    const name = `Deliverable ${Date.now()}`;
    await page.getByLabel("Deliverable name").fill(name);
    await page.getByRole("button", { name: "Add deliverable" }).click();
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

    await page.getByRole("button", { name: `Edit deliverable ${name}` }).click();
    await dialog(page).getByLabel("Document link").fill("javascript:alert(1)");
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(dialog(page).getByRole("alert")).toBeVisible();

    await dialog(page).getByLabel("Document link").fill("https://example.com/plan.docx");
    await dialog(page).getByLabel("Remarks").fill("Signed off by sponsor");
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page.getByText("Signed off by sponsor")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open" })).toHaveAttribute("href", "https://example.com/plan.docx");

    await confirmDelete(page, `deliverable ${name}`);
    await expect(page.getByRole("cell", { name, exact: true })).toHaveCount(0);
  });

  test("changes a risk and closes it, then deletes it", async ({ page }) => {
    await newHospital(page);
    const title = `Risk ${Date.now()}`;
    await page.getByLabel("Risk title").fill(title);
    await page.getByRole("button", { name: "Add risk" }).click();
    const row = page.getByRole("listitem").filter({ hasText: title });
    await expect(row).toBeVisible();

    await page.getByRole("button", { name: `Edit risk ${title}` }).click();
    await dialog(page).getByLabel("Severity").selectOption("critical");
    await dialog(page).getByLabel("Status").selectOption("closed");
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(row.getByText("(closed)")).toBeVisible();
    await expect(row.getByText("critical")).toBeVisible();

    await confirmDelete(page, `risk ${title}`);
    await expect(row).toHaveCount(0);
  });

  test("edits a dependency's title and date, then deletes it", async ({ page }) => {
    await newHospital(page);
    const title = `Dependency ${Date.now()}`;
    await page.getByLabel("Dependency title").fill(title);
    await page.getByLabel("Due date").fill("2031-05-10");
    await page.getByRole("button", { name: "Add dependency" }).click();
    await expect(page.getByText(title)).toBeVisible();

    const renamed = `${title} moved`;
    await page.getByRole("button", { name: `Edit dependency ${title}` }).click();
    await dialog(page).getByLabel("Title").fill(renamed);
    await dialog(page).getByLabel("Due date").fill("2031-06-20");
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(dialog(page)).toBeHidden();
    const row = page.getByRole("listitem").filter({ hasText: renamed });
    await expect(row).toContainText("2031-06-20");

    await confirmDelete(page, `dependency ${renamed}`);
    await expect(row).toHaveCount(0);
  });

  test("edits and deletes a baseline entry, recomputing the fee", async ({ page }) => {
    await newHospital(page);
    await page.getByLabel("Month").fill("2027-03");
    await page.getByLabel("Baseline ($)").fill("100");
    await page.getByLabel("Actual ($)").fill("140");
    await page.getByRole("button", { name: "Add entry" }).click();
    await expect(page.getByTestId("fee")).toHaveText("$12.00");

    await page.getByRole("button", { name: "Edit entry 2027-03" }).click();
    await dialog(page).getByLabel("Actual ($)").fill("160");
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page.getByTestId("incremental")).toHaveText("$60.00");
    await expect(page.getByTestId("fee")).toHaveText("$18.00");

    await confirmDelete(page, "entry 2027-03");
    await expect(page.getByText("No baseline entries yet")).toBeVisible();
    await expect(page.getByTestId("fee")).toHaveText("$0.00");
  });

  test("edits and deletes a to-do from the calendar list", async ({ page }) => {
    const title = `Todo ${Date.now()}`;
    await page.goto(`/calendar?m=${FUTURE}`);
    await page.getByLabel("New to-do title").fill(title);
    await page.getByRole("button", { name: "Add undated to-do" }).click();
    await expect(page.getByRole("list", { name: "To-do list" }).getByText(title)).toBeVisible();

    const renamed = `${title} edited`;
    await page.getByRole("button", { name: `Edit to-do ${title}` }).click();
    await dialog(page).getByLabel("Title").fill(renamed);
    await dialog(page).getByLabel("Due date").fill(`${FUTURE}-12`);
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page.getByRole("list", { name: "To-do list" }).getByText(renamed)).toBeVisible();

    await confirmDelete(page, `to-do ${renamed}`);
    await expect(page.getByRole("list", { name: "To-do list" }).getByText(renamed)).toHaveCount(0);
  });

  test("edits and deletes a meeting from its day panel", async ({ page }) => {
    const title = `Meeting ${Date.now()}`;
    await page.goto(`/calendar?m=${FUTURE}&d=${FUTURE}-18`);
    await page.getByLabel("Meeting title").fill(title);
    await page.getByRole("button", { name: "Add meeting" }).click();
    const events = page.getByRole("list", { name: "Events on this day" });
    await expect(events.getByText(title)).toBeVisible();

    const renamed = `${title} moved`;
    await page.getByRole("button", { name: `Edit meeting ${title}` }).click();
    await dialog(page).getByLabel("Title").fill(renamed);
    await dialog(page).getByRole("button", { name: "Save changes" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(events.getByText(renamed)).toBeVisible();

    await confirmDelete(page, `meeting ${renamed}`);
    await expect(events.getByText(renamed)).toHaveCount(0);
  });

  test("deletes a dependency from its day panel", async ({ page }) => {
    const title = `Day dependency ${Date.now()}`;
    await page.goto(`/calendar?m=${FUTURE}&d=${FUTURE}-19`);
    await page.getByRole("tab", { name: "Dependency" }).click();
    await page.getByLabel("Dependency title").fill(title);
    await page.getByRole("button", { name: "Add dependency" }).click();
    const events = page.getByRole("list", { name: "Events on this day" });
    await expect(events.getByText(title)).toBeVisible();

    await confirmDelete(page, `dependency ${title}`);
    await expect(events.getByText(title)).toHaveCount(0);
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("sees no edit or delete controls", async ({ page }) => {
    for (const url of [DEMO_A, `/calendar?m=${FUTURE}`, "/pmo"]) {
      await page.goto(url);
      await expect(page.getByRole("button", { name: /^(Edit|Delete) / })).toHaveCount(0);
    }
  });
});
