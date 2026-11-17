import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { VIEWER_EMAIL } from "./global-setup";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DEMO_A = "00000000-0000-0000-0000-0000000000b1";

test("responses carry the security headers", async ({ request }) => {
  const res = await request.get("/login");
  const h = res.headers();
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toContain("max-age=");
});

test("anonymous API access returns no rows", async () => {
  const client = createClient(url(), anon(), { auth: { persistSession: false } });
  for (const table of ["projects", "risks", "baseline_entries", "todos", "audit_log", "profiles"]) {
    const { data } = await client.from(table).select("*");
    expect(data ?? [], table).toHaveLength(0);
  }
});

test("a viewer cannot write through the API directly", async () => {
  const client = createClient(url(), anon(), { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({
    email: VIEWER_EMAIL,
    password: process.env.E2E_PASSWORD!,
  });
  expect(signInError).toBeNull();

  const insert = await client.from("projects").insert({ name: "Hacked", kind: "hospital", scenario: "A" });
  expect(insert.error).not.toBeNull();

  const update = await client.from("risks").update({ title: "Hacked" }).eq("project_id", DEMO_A).select();
  expect(update.data ?? []).toHaveLength(0);

  const del = await client.from("baseline_entries").delete().eq("project_id", DEMO_A).select();
  expect(del.data ?? []).toHaveLength(0);

  const promote = await client.from("profiles").update({ role: "owner" }).select();
  expect(promote.data ?? []).toHaveLength(0);

  const reread = await client.from("risks").select("title").eq("project_id", DEMO_A);
  expect((reread.data ?? []).some((r) => r.title === "Hacked")).toBe(false);
});

test("public sign-up is disabled at the auth API", async () => {
  const client = createClient(url(), anon(), { auth: { persistSession: false } });
  const { data, error } = await client.auth.signUp({
    email: `intruder-${Date.now()}@test.local`,
    password: `Pw-${Date.now()}-xYz!`,
  });
  expect(error?.code).toBe("signup_disabled");
  expect(data.session).toBeNull();
});

test("session cookies are httpOnly", async () => {
  const { readFileSync } = await import("node:fs");
  const state = JSON.parse(readFileSync("tests/e2e/.auth/owner.json", "utf8")) as {
    cookies: { name: string; httpOnly: boolean }[];
  };
  const session = state.cookies.filter((c) => c.name.startsWith("sb-"));
  expect(session.length).toBeGreaterThan(0);
  for (const c of session) expect(c.httpOnly, c.name).toBe(true);
});

test("a user can change their own display name through the API, but never their role", async () => {
  const client = createClient(url(), anon(), { auth: { persistSession: false } });
  await client.auth.signInWithPassword({ email: VIEWER_EMAIL, password: process.env.E2E_PASSWORD! });
  const { data: me } = await client.auth.getUser();

  const rename = await client.from("profiles").update({ full_name: "Via API" }).eq("id", me.user!.id).select("full_name");
  expect(rename.data?.[0]?.full_name).toBe("Via API");

  const promote = await client.from("profiles").update({ role: "owner" }).eq("id", me.user!.id).select();
  expect(promote.error).not.toBeNull();
  const { data: profile } = await client.from("profiles").select("role").eq("id", me.user!.id).single();
  expect(profile?.role).toBe("viewer");

  // Leave the shared viewer account as it was found.
  await client.from("profiles").update({ full_name: null }).eq("id", me.user!.id);
});
