import { createClient } from "@/lib/supabase/server";
import { startEnrollment } from "./actions";
import { MfaForm } from "./MfaForm";

export default async function MfaPage() {
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp?.[0]; // listFactors().totp only contains verified factors

  const enrollment = verified ? null : await startEnrollment();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="ambient" aria-hidden />
      <div className="glass-card w-full max-w-sm space-y-4 p-8">
        <h1 className="text-xl font-bold text-[var(--heading)]">Two-factor authentication</h1>
        {enrollment ? (
          <>
            <p className="text-sm text-[var(--muted)]">
              Scan this QR code with your authenticator app, then enter the 6-digit code.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enrollment.qr} alt="TOTP QR code" className="mx-auto h-40 w-40 rounded bg-white p-2" />
            <p className="break-all text-center text-xs text-[var(--muted)]">Secret: {enrollment.secret}</p>
            <MfaForm factorId={enrollment.factorId} />
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)]">Enter the 6-digit code from your authenticator app.</p>
            <MfaForm factorId={verified!.id} />
          </>
        )}
      </div>
    </main>
  );
}
