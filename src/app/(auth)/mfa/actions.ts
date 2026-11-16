"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";
import { totpCodeSchema } from "@/lib/validation";

export type MfaState = { error?: string; codes?: string[] } | undefined;

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

/**
 * Checks a 6-digit code. After a first-time enrollment it also creates the recovery codes and returns them
 * (shown once by the form); otherwise it sends the user on, to the page named by `next` or to the dashboard.
 */
export async function verifyTotp(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const code = totpCodeSchema.safeParse(formData.get("code"));
  const factorId = String(formData.get("factorId") ?? "");
  if (!code.success || !factorId) return { error: "Enter the 6-digit code" };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.data });
  if (error) return { error: "Invalid code" };

  if (formData.get("enrolling") === "1") {
    const { data: codes, error: codesError } = await supabase.rpc("generate_recovery_codes");
    if (!codesError && Array.isArray(codes)) {
      await recordAudit("mfa_enrolled");
      return { codes: codes as string[] };
    }
    // Enrolment itself worked; the codes can be generated later from the Account page.
  }

  redirect(formData.get("next") === "/reset-password" ? "/reset-password" : "/");
}

/** Redeems a recovery code: removes the lost authenticator, signs out, and sends the user to sign in again. */
export async function redeemRecoveryCode(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const code = String(formData.get("code") ?? "").slice(0, 40);
  if (!code.trim()) return { error: "Enter a recovery code" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("use_recovery_code", { code });
  if (error) return { error: "Could not check the code. Try again." };
  if (data !== true) return { error: "Invalid or already used code" };

  await recordAudit("mfa_recovered");
  await supabase.auth.signOut();
  redirect("/login?recovered=1");
}
