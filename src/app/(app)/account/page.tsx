import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileForm } from "./ProfileForm";
import { RecoveryCodesSection } from "./RecoveryCodesSection";

export default async function AccountPage() {
  const supabase = await createClient();
  const [session, factors, remaining, claims] = await Promise.all([
    getSession(),
    supabase.auth.mfa.listFactors(),
    supabase.rpc("recovery_codes_remaining"),
    supabase.auth.getClaims(),
  ]);
  const hasFactor = (factors.data?.totp?.length ?? 0) > 0;
  const email = typeof claims.data?.claims?.email === "string" ? claims.data.claims.email : "";

  return (
    <div className="space-y-4">
      <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--heading)]">Account</h2>

      <Card title="Profile">
        <ProfileForm name={session?.hasName ? session.name : ""} email={email} />
      </Card>

      <Card title="Password" delay={0.05}>
        <ChangePasswordForm />
      </Card>

      <Card
        title="Two-step verification"
        delay={0.1}
        action={<Badge tone={hasFactor ? "ok" : "warn"}>{hasFactor ? "Authenticator on" : "Not set up"}</Badge>}
      >
        <RecoveryCodesSection
          remaining={typeof remaining.data === "number" ? remaining.data : 0}
          canGenerate={hasFactor && session?.aal === "aal2"}
        />
      </Card>
    </div>
  );
}
