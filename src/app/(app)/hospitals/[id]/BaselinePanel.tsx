"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Dialog } from "@/components/ui/Dialog";
import { EditBaselineForm } from "@/components/edit/EditForms";
import { calcFee } from "@/domain/fee";
import { deleteBaselineEntry } from "../edit-actions";
import { addBaselineEntry } from "../ops-actions";

export type BaselineRow = { id: string; month: string; baseline: number; actual: number };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const FIELD = "rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";

function TrendChart({ rows }: { rows: BaselineRow[] }) {
  if (rows.length < 2) return null;
  const W = 320;
  const H = 110;
  const values = rows.flatMap((r) => [r.baseline, r.actual]);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1; // flat data still draws a centered line
  const x = (i: number) => (i / (rows.length - 1)) * (W - 16) + 8;
  const y = (v: number) => H - 14 - ((v - lo) / span) * (H - 28);
  const pts = (key: "baseline" | "actual") => rows.map((r, i) => `${x(i)},${y(r[key])}`).join(" ");
  const area = `${x(0)},${H - 6} ${pts("actual")} ${x(rows.length - 1)},${H - 6}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-3 h-28 w-full"
      role="img"
      aria-label="Baseline versus actual trend"
    >
      <defs>
        <linearGradient id="actual-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#actual-fill)" />
      <polyline points={pts("baseline")} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
      <polyline points={pts("actual")} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function BaselinePanel({ projectId, rows, editable }: { projectId: string; rows: BaselineRow[]; editable: boolean }) {
  const [state, action, pending] = useActionState(addBaselineEntry.bind(null, projectId), undefined);
  const { incremental, fee } = calcFee(rows);
  const sorted = [...rows].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <Card title="Baseline and fee" delay={0.12}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[var(--muted)]">Incremental gross profit</p>
          <p data-testid="incremental" className="text-2xl font-bold text-[var(--heading)]">{money.format(incremental)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)]">Estimated fee (30%)</p>
          <p data-testid="fee" className="text-2xl font-bold text-[var(--heading)]">{money.format(fee)}</p>
        </div>
      </div>

      <TrendChart rows={sorted} />

      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No baseline entries yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-xs [&_td]:pr-3 [&_th]:pr-3">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="py-1">Month</th>
                <th>Baseline</th>
                <th>Actual</th>
                <th>Difference</th>
                {editable && (
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="py-1">{r.month.slice(0, 7)}</td>
                  <td>{money.format(r.baseline)}</td>
                  <td>{money.format(r.actual)}</td>
                  <td className={r.actual >= r.baseline ? "text-emerald-600" : "text-rose-600"}>
                    {money.format(r.actual - r.baseline)}
                  </td>
                  {editable && (
                    <td className="whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-0.5">
                        <Dialog icon="edit" triggerLabel={`Edit entry ${r.month.slice(0, 7)}`} title="Edit baseline entry">
                          <EditBaselineForm projectId={projectId} entry={r} />
                        </Dialog>
                        <DeleteButton
                          label={`entry ${r.month.slice(0, 7)}`}
                          action={deleteBaselineEntry.bind(null, projectId, r.id)}
                        />
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editable && (
        <form action={action} noValidate className="mt-4 grid grid-cols-2 items-end gap-3 border-t border-[var(--border)] pt-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="b-month" className="text-xs font-medium">Month</label>
            <input id="b-month" name="month" type="month" className={FIELD} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="b-base" className="text-xs font-medium">Baseline ($)</label>
            <input id="b-base" name="baseline" type="number" min="0" step="0.01" className={FIELD} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="b-actual" className="text-xs font-medium">Actual ($)</label>
            <input id="b-actual" name="actual" type="number" min="0" step="0.01" className={FIELD} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="col-span-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add entry
          </button>
          {state?.error && <p role="alert" className="w-full text-sm font-medium text-rose-600">{state.error}</p>}
        </form>
      )}
    </Card>
  );
}
