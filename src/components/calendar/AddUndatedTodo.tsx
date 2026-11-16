"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addTodo } from "@/app/(app)/todos/actions";

/** Quick add for a to-do with no date (dated ones are added from a day in the calendar). */
export function AddUndatedTodo() {
  const [state, action, pending] = useActionState(addTodo, undefined);
  return (
    <form action={action} className="mt-3 border-t border-[var(--border)] pt-3">
      <div className="flex gap-2">
        <input
          name="title"
          required
          aria-label="New to-do title"
          placeholder="New to-do, no date"
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Add undated to-do"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white disabled:opacity-60"
        >
          <Plus size={16} strokeWidth={2.6} />
        </button>
      </div>
      {state?.error && <p role="alert" className="mt-2 text-sm font-medium text-rose-600">{state.error}</p>}
    </form>
  );
}
