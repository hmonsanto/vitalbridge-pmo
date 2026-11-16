"use client";

import { useActionState } from "react";
import { addDeliverable } from "../actions";

const FIELD = "rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";

export function AddDeliverableForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(addDeliverable.bind(null, projectId), undefined);
  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="d-name" className="text-xs font-medium">Deliverable name</label>
        <input id="d-name" name="name" required className={FIELD} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="d-phase" className="text-xs font-medium">Phase</label>
        <select id="d-phase" name="phase" defaultValue="1" className={FIELD}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="d-owner" className="text-xs font-medium">Owner</label>
        <input id="d-owner" name="owner" className={FIELD} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Add deliverable
      </button>
      {state?.error && <p role="alert" className="w-full text-sm font-medium text-rose-600">{state.error}</p>}
    </form>
  );
}
