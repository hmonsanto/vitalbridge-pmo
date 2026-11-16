import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { MfaForm } from "@/app/(auth)/mfa/MfaForm";
import { isRecoverySession } from "@/lib/recovery-session";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

/**
 * Reached only from the emailed link. Someone who signed in normally is sent to the Account page instead,
 * where the current password is required, so this screen is not a way around that.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/forgot-password");
  if (!isRecoverySession(data.claims)) redirect("/account");

  // With two-step verification on, the authenticator code comes before the new password.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp?.[0];
    if (factor) {
      return (
        <AuthCard title="Confirm it's you" subtitle="Enter the code from your authenticator app before choosing a new password.">
          <MfaForm factorId={factor.id} next="/reset-password" />
        </AuthCard>
      );
    }
  }

  return (
    <AuthCard title="Choose a new password" subtitle="This replaces your current password.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
