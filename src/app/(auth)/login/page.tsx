"use client";

import { useActionState } from "react";
import { BrandMark, BrandWordmark } from "@/components/brand/Brand";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="ambient" aria-hidden />
      <form action={action} className="glass-card w-full max-w-sm space-y-4 p-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <BrandMark size={44} />
            <BrandWordmark className="text-2xl" />
          </div>
          <h1 className="font-display text-xl font-bold text-[var(--heading)]">Project management office</h1>
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
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 font-semibold text-white shadow-lg shadow-[#6b1f2a]/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
