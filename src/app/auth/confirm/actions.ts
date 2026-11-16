"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ConfirmState = { error?: string } | undefined;

const INVALID = "This link is invalid or has expired. Request a new one.";

/** Turns the one-time token from the email into a session, then sends the user to choose a new password. */
export async function confirmRecovery(_prev: ConfirmState, formData: FormData): Promise<ConfirmState> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  if (!/^[\w-]{8,200}$/.test(tokenHash)) return { error: INVALID };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
  if (error) return { error: INVALID };

  redirect("/reset-password");
}
