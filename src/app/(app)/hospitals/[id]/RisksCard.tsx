"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { addRisk } from "../ops-actions";

export type RiskRow = { id: string; title: string; severity: string; owner: string | null; status: string };

const TONE = { critical: "danger", high: "warn", medium: "info", low: "ok" } as const;
const FIELD = "rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";

export function RisksCard({ projectId, risks, editable }: { projectId: string; risks: RiskRow[]; editable: boolean }) {
  const [state, action, pending] = useActionState(addRisk.bind(null, projectId), undefined);
  return (
    <Card title="Risks" delay={0.15}>
      {risks.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No risks recorded.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {risks.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3">
              <span>
                {r.title}
                {r.status === "closed" && <span className="ml-2 text-xs text-[var(--muted)]">(closed)</span>}
              </span>
              <Badge tone={TONE[r.severity as keyof typeof TONE] ?? "info"}>{r.severity}</Badge>
            </li>
          ))}
        </ul>
      )}
      {editable && (
        <form action={action} className="mt-4 flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="r-title" className="text-xs font-medium">Risk title</label>
            <input id="r-title" name="title" required className={FIELD} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="r-sev" className="text-xs font-medium">Severity</label>
            <select id="r-sev" name="severity" defaultValue="medium" className={FIELD}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add risk
          </button>
          {state?.error && <p role="alert" className="w-full text-sm font-medium text-rose-600">{state.error}</p>}
        </form>
      )}
    </Card>
  );
}
