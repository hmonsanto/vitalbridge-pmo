"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={action}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg backdrop-blur"
      >
        <div>
          <h1 className="text-xl font-bold text-[var(--heading)]">VitalBridge RX PMO</h1>
          <p className="text-sm text-[var(--muted)]">Sign in to continue</p>
        </div>

        <label className="block text-sm font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-slate-900"
        />

        <label className="block text-sm font-medium" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-slate-900"
        />

        {state?.error && (
          <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
