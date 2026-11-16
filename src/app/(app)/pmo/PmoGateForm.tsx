"use client";

import { useActionState } from "react";
import { decidePmoGate } from "./actions";

const FIELD = "rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";

export function PmoGateForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(decidePmoGate.bind(null, projectId), undefined);
  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="p-gate" className="text-xs font-medium">Gate</label>
        <select id="p-gate" name="gate" defaultValue="G0" className={FIELD}>
          {["G0", "G1", "G2", "G3", "G4", "G5"].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="p-decision" className="text-xs font-medium">Decision</label>
        <select id="p-decision" name="decision" defaultValue="" className={FIELD}>
          <option value="">Select...</option>
          <option value="go">Go</option>
          <option value="go_with_conditions">Go with conditions</option>
          <option value="replan">Re-plan</option>
          <option value="stop">Stop</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="p-notes" className="text-xs font-medium">Notes</label>
        <input id="p-notes" name="notes" className={FIELD} />
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
