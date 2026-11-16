"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Dialog } from "@/components/ui/Dialog";
import { EditDependencyForm } from "@/components/edit/EditForms";
import { isOverdue } from "@/domain/dependencies";
import { deleteDependency } from "../edit-actions";
import { addDependency, markDependencyDone } from "../ops-actions";

export type DependencyRow = { id: string; title: string; type: string; due_date: string; status: string };

const FIELD = "rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";

export function DependenciesCard({
  projectId,
  dependencies,
  editable,
}: {
  projectId: string;
  dependencies: DependencyRow[];
  editable: boolean;
}) {
  const [state, action, pending] = useActionState(addDependency.bind(null, projectId), undefined);
  return (
    <Card title="External dependencies" delay={0.2}>
      {dependencies.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No external dependencies recorded.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {dependencies.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3">
              <span>
                <span className="font-medium">{d.title}</span>
                <span className="ml-2 text-xs text-[var(--muted)]">{d.type} · due {d.due_date}</span>
              </span>
              <span className="flex items-center gap-2">
                {d.status === "done" ? (
                  <Badge tone="ok">Done</Badge>
                ) : isOverdue(d.due_date, d.status) ? (
                  <Badge tone="danger">Overdue</Badge>
                ) : (
                  <Badge tone="info">{d.status.replace("_", " ")}</Badge>
                )}
                {editable && d.status !== "done" && (
                  <form action={markDependencyDone.bind(null, projectId, d.id)}>
                    <button className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs">Mark done</button>
                  </form>
                )}
                {editable && (
                  <span className="flex items-center gap-0.5">
                    <Dialog icon="edit" triggerLabel={`Edit dependency ${d.title}`} title="Edit dependency">
                      <EditDependencyForm projectId={projectId} dependency={d} />
                    </Dialog>
                    <DeleteButton label={`dependency ${d.title}`} action={deleteDependency.bind(null, projectId, d.id)} />
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {editable && (
        <form action={action} className="mt-4 flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="dep-title" className="text-xs font-medium">Dependency title</label>
            <input id="dep-title" name="title" required className={FIELD} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dep-type" className="text-xs font-medium">Type</label>
            <select id="dep-type" name="type" defaultValue="license" className={FIELD}>
              <option value="license">License</option>
              <option value="dea">DEA</option>
              <option value="340b">340B</option>
              <option value="payer">Payer contract</option>
              <option value="accreditation">Accreditation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dep-due" className="text-xs font-medium">Due date</label>
            <input id="dep-due" name="due_date" type="date" required className={FIELD} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add dependency
          </button>
          {state?.error && <p role="alert" className="w-full text-sm font-medium text-rose-600">{state.error}</p>}
        </form>
      )}
    </Card>
  );
}
