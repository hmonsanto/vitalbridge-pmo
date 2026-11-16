import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const OWNER_EMAIL = "owner-e2e@test.local";
export const VIEWER_EMAIL = "viewer-e2e@test.local";

export default async function globalSetup() {
  const password = `Pw-${randomUUID()}`;
  process.env.E2E_PASSWORD = password;

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of existing?.users ?? []) {
    if (u.email === OWNER_EMAIL || u.email === VIEWER_EMAIL) await admin.auth.admin.deleteUser(u.id);
  }

  for (const email of [OWNER_EMAIL, VIEWER_EMAIL]) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    if (email === OWNER_EMAIL) {
      await admin.from("profiles").update({ role: "owner" }).eq("id", data.user.id);
    }
  }
}
