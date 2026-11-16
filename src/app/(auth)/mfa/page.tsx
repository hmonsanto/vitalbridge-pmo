import { AuthCard } from "@/components/auth/AuthCard";
import { createClient } from "@/lib/supabase/server";
import { startEnrollment } from "./actions";
import { MfaForm } from "./MfaForm";

export default async function MfaPage() {
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp?.[0]; // listFactors().totp only contains verified factors

  const enrollment = verified ? null : await startEnrollment();

  return (
    <AuthCard title="Two-factor authentication">
      {enrollment ? (
        <>
          <p className="text-sm text-[var(--muted)]">
            Scan this QR code with your authenticator app, then enter the 6-digit code.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrollment.qr} alt="TOTP QR code" className="mx-auto h-40 w-40 rounded bg-white p-2" />
          <p className="break-all text-center text-xs text-[var(--muted)]">Secret: {enrollment.secret}</p>
        </>
      ) : null}
      {/*
        One form in one stable position. Verifying an enrolment makes the server re-render this page in its
        "already enrolled" shape; if the form were a different element there, it would be unmounted and the
        recovery codes it just received would be lost before anyone could read them.
      */}
      <MfaForm key="mfa-form" factorId={enrollment?.factorId ?? verified!.id} enrolling={Boolean(enrollment)} />
    </AuthCard>
  );
}
