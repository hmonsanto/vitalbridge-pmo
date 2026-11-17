import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { EDITOR_STATE, OWNER_STATE, VIEWER_STATE } from "./global-setup";

const URL = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PASSWORD = () => process.env.E2E_PASSWORD!;

const admin = () => createClient(URL(), process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

/** A throwaway person to manage, so these tests never disturb the shared accounts. */
async function newPerson(prefix: string, role?: "editor" | "owner") {
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@test.local`;
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD(), email_confirm: true });
  if (error || !data.user) throw error ?? new Error("createUser failed");
  if (role) await admin().from("profiles").update({ role }).eq("id", data.user.id);
  return { email, id: data.user.id };
}

const row = (page: Page, email: string) => page.locator(`tr[data-member="${email}"]`);

test.describe("admin", () => {
  test.use({ storageState: OWNER_STATE });

  test("sees the team page, with themselves marked and no role selector for their own row", async ({ page }) => {
    await page.goto("/team");
    await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
    await expect(page.getByTestId("team-summary")).toContainText("active");
    const me = row(page, "owner-e2e@test.local");
    await expect(me).toContainText("(you)");
    await expect(me).toContainText("Admin");
    await expect(me.getByRole("combobox")).toHaveCount(0); // an admin cannot change their own role
    await expect(page.getByRole("button", { name: /^Deactivate owner-e2e/ })).toHaveCount(0);
  });

  test("the Team entry is in the navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Team" })).toBeVisible();
  });

  test("changes a person's role and it sticks", async ({ page }) => {
    const { email } = await newPerson("role");
    await page.goto("/team");
    const who = email.split("@")[0];
    await page.getByLabel(`Role for ${who}`).selectOption("editor");
    await page.reload();
    await expect(page.getByLabel(`Role for ${who}`)).toHaveValue("editor");
    // An editor without two-step verification is flagged, because it will be required.
    await expect(row(page, email)).toContainText("Not set up");
  });

  test("sets a person's name from the team page", async ({ page }) => {
    const { email } = await newPerson("name");
    await page.goto("/team");
    await page.getByRole("button", { name: `Edit name of ${email.split("@")[0]}` }).click();
    await page.getByRole("dialog").getByLabel("Display name").fill("Ada Lovelace");
    await page.getByRole("dialog").getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(row(page, email)).toContainText("Ada Lovelace");
  });

  test("deactivating blocks sign-in, and reactivating restores it", async ({ page }) => {
    const { email } = await newPerson("off");
    const who = email.split("@")[0];
    expect((await createClient(URL(), ANON()).auth.signInWithPassword({ email, password: PASSWORD() })).error).toBeNull();

    await page.goto("/team");
    await page.getByRole("button", { name: `Deactivate ${who}` }).click();
    await page.getByRole("button", { name: "Yes, deactivate" }).click();
    await expect(row(page, email)).toContainText("Deactivated");
    expect((await createClient(URL(), ANON()).auth.signInWithPassword({ email, password: PASSWORD() })).error).not.toBeNull();

    await page.getByRole("button", { name: `Reactivate ${who}` }).click();
    await expect(row(page, email)).toContainText("Active");
    expect((await createClient(URL(), ANON()).auth.signInWithPassword({ email, password: PASSWORD() })).error).toBeNull();
  });
});

test.describe("editor", () => {
  test.use({ storageState: EDITOR_STATE });

  test("can create and edit project data, and is shown as an Editor", async ({ page }) => {
    await page.goto("/hospitals");
    await expect(page.getByTestId("user-role")).toHaveText("Editor");
    await expect(page.getByRole("link", { name: "Add Hospital" })).toBeVisible();

    await page.goto("/hospitals/new");
    const name = `Editor Hospital ${Date.now()}`;
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Scenario").selectOption("A");
    await page.getByRole("button", { name: "Create hospital" }).click();
    await expect(page).toHaveURL(/\/hospitals\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("button", { name: "Edit hospital" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add deliverable" })).toBeVisible();
  });

  test("has no Team page: no menu entry, and the address leads back to the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Team" })).toHaveCount(0);
    await page.goto("/team");
    await expect(page).toHaveURL("/");
  });
});

test.describe("viewer", () => {
  test.use({ storageState: VIEWER_STATE });

  test("has no Team page either", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Team" })).toHaveCount(0);
    await page.goto("/team");
    await expect(page).toHaveURL("/");
  });
});

test.describe("rules that hold at the database", () => {
  async function signedIn(email: string) {
    const client = createClient(URL(), ANON(), { auth: { persistSession: false } });
    const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD() });
    expect(error).toBeNull();
    return client;
  }

  test("an editor can write project data through the API but cannot manage people", async () => {
    const client = await signedIn("editor-e2e@test.local");
    const insert = await client.from("projects").insert({ name: `API editor ${Date.now()}`, kind: "hospital", scenario: "A" }).select("id");
    expect(insert.error).toBeNull();
    await client.from("projects").delete().eq("id", insert.data![0].id);

    expect((await client.rpc("team_members")).error).not.toBeNull();
    const { data: me } = await client.auth.getUser();
    const promote = await client.rpc("set_user_role", { target: me.user!.id, new_role: "owner" });
    expect(promote.error).not.toBeNull();
    expect((await client.from("profiles").update({ role: "owner" }).eq("id", me.user!.id)).error).not.toBeNull();
  });

  test("a viewer cannot write project data or manage people", async () => {
    const client = await signedIn("viewer-e2e@test.local");
    expect((await client.from("projects").insert({ name: "Nope", kind: "hospital", scenario: "A" })).error).not.toBeNull();
    expect((await client.rpc("team_members")).error).not.toBeNull();
  });

  test("an editor must set up two-step verification at the first sign-in", async ({ page }) => {
    const { email } = await newPerson("mfa-editor", "editor");
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(PASSWORD());
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/mfa$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/mfa$/);
  });
});
