"use client";

import { useActionState } from "react";
import { AUTH_FIELD } from "@/components/auth/AuthCard";
import { updateDisplayName } from "./actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateDisplayName, undefined);
  return (
    <form action={action} noValidate className="max-w-md space-y-3">
      <div>
        <label htmlFor="profile-name" className="mb-1 block text-sm font-medium">Display name</label>
        <input
          id="profile-name"
          name="name"
          defaultValue={name}
          maxLength={80}
          autoComplete="name"
          placeholder="How you want to be shown"
          className={AUTH_FIELD}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">Shown in the menu and in the greeting. Your email is {email}.</p>
      </div>
      {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm font-medium text-emerald-700">Name saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save name"}
      </button>
    </form>
  );
}
