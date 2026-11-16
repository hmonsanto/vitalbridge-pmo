"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { totpCodeSchema } from "@/lib/validation";

export type MfaState = { error?: string } | undefined;

/** Starts TOTP enrollment (dropping stale unverified factors first). */
export async function startEnrollment(): Promise<{ factorId: string; qr: string; secret: string }> {
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator" });
  if (error || !data) throw new Error("Could not start MFA enrollment");
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyTotp(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const code = totpCodeSchema.safeParse(formData.get("code"));
  const factorId = String(formData.get("factorId") ?? "");
  if (!code.success || !factorId) return { error: "Enter the 6-digit code" };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.data });
  if (error) return { error: "Invalid code" };

  redirect("/");
}
