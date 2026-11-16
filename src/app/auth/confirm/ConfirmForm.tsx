"use client";

import { useActionState } from "react";
import { AUTH_BUTTON } from "@/components/auth/AuthCard";
import { confirmRecovery } from "./actions";

/**
 * The email link only opens this page; the token is used when the person presses Continue. That keeps mail
 * scanners and link previewers, which load links automatically, from burning a one-time token.
 */
export function ConfirmForm({ tokenHash }: { tokenHash: string }) {
  const [state, action, pending] = useActionState(confirmRecovery, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token_hash" value={tokenHash} />
      {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={AUTH_BUTTON}>
        {pending ? "Checking..." : "Continue"}
      </button>
    </form>
  );
}
