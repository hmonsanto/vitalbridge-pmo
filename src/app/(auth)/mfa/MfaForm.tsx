"use client";

import { useActionState } from "react";
import { verifyTotp } from "./actions";

export function MfaForm({ factorId }: { factorId: string }) {
  const [state, action, pending] = useActionState(verifyTotp, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="factorId" value={factorId} />
      <label htmlFor="code" className="block text-sm font-medium">Code</label>
      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        required
        className="w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-center text-lg tracking-widest text-slate-900"
      />
      {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
