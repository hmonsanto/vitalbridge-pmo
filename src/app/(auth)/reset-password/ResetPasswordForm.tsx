"use client";

import { useActionState } from "react";
import { AUTH_BUTTON } from "@/components/auth/AuthCard";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { resetPassword } from "./actions";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} noValidate className="space-y-3">
      <PasswordFields prefix="reset" />
      {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={AUTH_BUTTON}>
        {pending ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
