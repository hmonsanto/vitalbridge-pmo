"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { RecoveryCodesPanel } from "@/components/auth/RecoveryCodesPanel";
import { AUTH_BUTTON, AUTH_FIELD } from "@/components/auth/AuthCard";
import { redeemRecoveryCode, verifyTotp } from "./actions";

type Props = {
  factorId: string;
  /** First-time enrolment: show recovery codes once the code is accepted. */
  enrolling?: boolean;
  /** Where to go after a successful check. Only "/reset-password" is honoured; anything else goes home. */
  next?: string;
};

export function MfaForm({ factorId, enrolling = false, next }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(verifyTotp, undefined);
  const [recovering, setRecovering] = useState(false);

  if (state?.codes) {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-[var(--heading)]">Save your recovery codes</h2>
        <RecoveryCodesPanel
          codes={state.codes}
          onDone={() => {
            router.push("/");
            router.refresh();
          }}
        />
      </div>
    );
  }

  if (recovering) return <RecoveryCodeForm onBack={() => setRecovering(false)} />;

  return (
    <div className="space-y-3">
      {!enrolling && <p className="text-sm text-[var(--muted)]">Enter the 6-digit code from your authenticator app.</p>}
      <form action={action} className="space-y-3">
        <input type="hidden" name="factorId" value={factorId} />
        {enrolling && <input type="hidden" name="enrolling" value="1" />}
        {next && <input type="hidden" name="next" value={next} />}
        <label htmlFor="code" className="block text-sm font-medium">Code</label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          className={`${AUTH_FIELD} text-center text-lg tracking-widest`}
        />
        {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
        <button type="submit" disabled={pending} className={AUTH_BUTTON}>
          {pending ? "Verifying..." : "Verify"}
        </button>
      </form>
      {!enrolling && (
        <button
          type="button"
          onClick={() => setRecovering(true)}
          className="w-full text-center text-sm font-medium text-[var(--link)] hover:underline"
        >
          Lost your authenticator? Use a recovery code
        </button>
      )}
    </div>
  );
}

function RecoveryCodeForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState(redeemRecoveryCode, undefined);
  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Enter one of the recovery codes you saved. It removes the lost authenticator, and you will set up a new one.
      </p>
      <label htmlFor="recovery-code" className="block text-sm font-medium">Recovery code</label>
      <input
        id="recovery-code"
        name="code"
        autoComplete="off"
        placeholder="XXXX-XXXX-XXXX"
        required
        className={`${AUTH_FIELD} text-center font-mono tracking-wider`}
      />
      {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={AUTH_BUTTON}>
        {pending ? "Checking..." : "Use recovery code"}
      </button>
      <button type="button" onClick={onBack} className="w-full text-center text-sm font-medium text-[var(--muted)] hover:underline">
        Back to the authenticator code
      </button>
    </form>
  );
}
