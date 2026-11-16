import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { RecoveryCodesSection } from "./RecoveryCodesSection";

export default async function AccountPage() {
  const supabase = await createClient();
  const [session, factors, remaining] = await Promise.all([
    getSession(),
    supabase.auth.mfa.listFactors(),
    supabase.rpc("recovery_codes_remaining"),
  ]);
  const hasFactor = (factors.data?.totp?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--heading)]">Account</h2>

      <Card title="Password">
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
