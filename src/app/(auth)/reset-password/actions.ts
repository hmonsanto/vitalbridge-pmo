"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";
import { isRecoverySession } from "@/lib/recovery-session";
import { newPasswordSchema } from "@/lib/validation";

export type ResetState = { error?: string } | undefined;

export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = newPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.path[0] === "confirm");
    return { error: mismatch ? "The passwords do not match" : "Use between 12 and 72 characters" };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims || !isRecoverySession(data.claims)) {
    return { error: "This reset session is not valid. Request a new link." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you are not using now" };
    if (error.code === "weak_password") return { error: "That password is too easy to guess. Try a longer one." };
    if (error.code === "insufficient_aal") return { error: "Enter the code from your authenticator first." };
    return { error: "Could not update the password. Request a new link and try again." };
  }

  // Anyone else signed in with the old password is signed out.
  await supabase.auth.signOut({ scope: "others" });
  await recordAudit("password_reset");
  redirect("/");
}
