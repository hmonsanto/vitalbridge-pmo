"use client";

import { useActionState } from "react";
import { createHospital } from "../actions";

const FIELD = "w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-slate-900";

export function NewHospitalForm() {
  const [state, action, pending] = useActionState(createHospital, undefined);
  return (
    <form action={action} noValidate className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <label htmlFor="name" className="block text-sm font-medium">Name</label>
      <input id="name" name="name" className={FIELD} />

      <label htmlFor="scenario" className="block text-sm font-medium">Scenario</label>
      <select id="scenario" name="scenario" defaultValue="" className={FIELD}>
        <option value="">Select...</option>
        <option value="A">A: hospital with a pharmacy</option>
        <option value="B">B: program, no pharmacy</option>
        <option value="C">C: starting from scratch</option>
      </select>

      {state?.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        Create hospital
      </button>
    </form>
  );
}
