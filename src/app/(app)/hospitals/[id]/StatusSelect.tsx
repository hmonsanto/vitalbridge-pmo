"use client";

import { useTransition } from "react";
import { setDeliverableStatus } from "../actions";

export function StatusSelect({ projectId, deliverableId, status }: { projectId: string; deliverableId: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Deliverable status"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => void setDeliverableStatus(projectId, deliverableId, e.target.value))}
      className="rounded-lg border border-[var(--border)] bg-white/70 px-2 py-1 text-xs text-slate-900"
    >
      <option value="not_started">Not started</option>
      <option value="in_progress">In progress</option>
      <option value="completed">Completed</option>
      <option value="blocked">Blocked</option>
    </select>
  );
}
