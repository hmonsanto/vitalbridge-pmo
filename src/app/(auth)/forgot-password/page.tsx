"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AUTH_BUTTON, AUTH_FIELD, AuthCard } from "@/components/auth/AuthCard";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <AuthCard title="Reset your password" subtitle="Enter your email and we will send you a link to choose a new one.">
      {state?.sent ? (
        <p role="status" className="rounded-lg bg-[var(--track)] px-3 py-3 text-sm">
          If an account exists for that email, a reset link is on its way. It can take a minute to arrive.
        </p>
      ) : (
        <form action={action} className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required className={AUTH_FIELD} />
          {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
          <button type="submit" disabled={pending} className={AUTH_BUTTON}>
            {pending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <Link href="/login" className="block text-center text-sm font-medium text-[var(--link)] hover:underline">
        Back to sign in
      </Link>
    </AuthCard>
  );
}
