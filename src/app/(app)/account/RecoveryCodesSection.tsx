"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { RecoveryCodesPanel } from "@/components/auth/RecoveryCodesPanel";
import { generateRecoveryCodes } from "./actions";

export function RecoveryCodesSection({ remaining, canGenerate }: { remaining: number; canGenerate: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(generateRecoveryCodes, undefined);
  // Remember which result was dismissed (not just "dismissed"), so a stale set can never reappear while the next
  // one is still being generated.
  const [dismissed, setDismissed] = useState<typeof state>();
  const showCodes = Boolean(state?.codes) && dismissed !== state;

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Recovery codes remaining: <strong data-testid="codes-remaining">{remaining}</strong>
      </p>
      <p className="text-sm text-[var(--muted)]">
        If you lose your authenticator app, a recovery code lets you sign in and set up a new one. Generating new codes
        replaces the old ones.
      </p>

      {showCodes ? (
        <div className="max-w-md">
          <RecoveryCodesPanel
            codes={state!.codes!}
            onDone={() => {
              setDismissed(state);
              router.refresh();
            }}
          />
        </div>
      ) : canGenerate ? (
        <form action={action}>
          {state?.error && <p role="alert" className="mb-2 text-sm font-medium text-rose-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Generate new recovery codes
          </button>
        </form>
      ) : (
        <p className="text-sm text-[var(--muted)]">Recovery codes are available once two-step verification is on.</p>
      )}
    </div>
  );
}
