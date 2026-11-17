"use server";

import { revalidatePath } from "next/cache";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { displayNameSchema, newPasswordSchema } from "@/lib/validation";

export type AccountState = { error?: string; ok?: boolean; codes?: string[] } | undefined;

/** Changes the signed-in user's own password, after checking the current one. */
export async function changePassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const current = String(formData.get("current") ?? "");
  if (!current) return { error: "Enter your current password" };

  const parsed = newPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.path[0] === "confirm");
    return { error: mismatch ? "The new passwords do not match" : "Use between 12 and 72 characters" };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (!data?.claims?.sub || !email) return { error: "You are not signed in" };

  // Limits guessing: this form must not become a way to test passwords.
  if (!rateLimit(`pwchange:${data.claims.sub}`, 5, 15 * 60_000).allowed) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  // Check the current password with a throwaway client, so this browser's session (and its second-factor level)
  // is left exactly as it was.
  const probe = createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: wrong } = await probe.auth.signInWithPassword({ email, password: current });
  if (wrong) return { error: "That is not your current password" };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you are not using now" };
    if (error.code === "weak_password") return { error: "That password is too easy to guess. Try a longer one." };
    return { error: "Could not change the password. Try again." };
  }

  await supabase.auth.signOut({ scope: "others" });
  await recordAudit("password_change");
  return { ok: true };
}

/** Replaces the user's recovery codes with a fresh set, returned in clear text this one time. */
export async function generateRecoveryCodes(): Promise<AccountState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_recovery_codes");
  if (error || !Array.isArray(data)) {
    return { error: "Could not create the codes. Sign in again with your authenticator code and retry." };
  }
  await recordAudit("recovery_codes_generated");
  revalidatePath("/", "layout"); // the "save your codes" reminder depends on this
  return { codes: data as string[] };
}

/** Saves the signed-in person's own display name. The database lets each person change only this field of their own row. */
export async function updateDisplayName(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const parsed = displayNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: "Enter a name of 1 to 80 characters" };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return { error: "You are not signed in" };

  const { data: rows, error } = await supabase.from("profiles").update({ full_name: parsed.data }).eq("id", id).select("id");
  if (error || !rows?.length) return { error: "Could not save your name" };

  await recordAudit("profile_update", "profiles", id);
  revalidatePath("/", "layout"); // the menu and the greeting both show it
  return { ok: true };
}
