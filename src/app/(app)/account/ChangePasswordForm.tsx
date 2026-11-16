"use client";

import { useActionState } from "react";
import { AUTH_FIELD } from "@/components/auth/AuthCard";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} noValidate className="max-w-md space-y-3">
      <div>
        <label htmlFor="acct-current" className="mb-1 block text-sm font-medium">Current password</label>
        <input id="acct-current" name="current" type="password" autoComplete="current-password" required className={AUTH_FIELD} />
      </div>
      <PasswordFields prefix="acct" />
      {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm font-medium text-emerald-700">Password changed. Other devices were signed out.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
