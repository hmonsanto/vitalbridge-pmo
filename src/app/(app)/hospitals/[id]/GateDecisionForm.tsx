"use client";

import { useActionState } from "react";
import { decideGate } from "../actions";

const FIELD = "rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";

export function GateDecisionForm({ projectId, phase }: { projectId: string; phase: number }) {
  const [state, action, pending] = useActionState(decideGate.bind(null, projectId), undefined);
  return (
    <form action={action} className="mt-5 flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-4">
      <p className="w-full text-xs font-medium text-[var(--muted)]">Gate G{phase} decision</p>
      <div className="flex flex-col gap-1">
        <label htmlFor="g-decision" className="text-xs font-medium">Decision</label>
        <select id="g-decision" name="decision" defaultValue="" className={FIELD}>
          <option value="">Select...</option>
          <option value="go">Go</option>
          <option value="go_with_conditions">Go with conditions</option>
          <option value="replan">Re-plan</option>
          <option value="stop">Stop</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="g-notes" className="text-xs font-medium">Notes</label>
        <input id="g-notes" name="notes" className={FIELD} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Record decision
      </button>
      {state?.error && <p role="alert" className="w-full text-sm font-medium text-rose-600">{state.error}</p>}
    </form>
  );
}
