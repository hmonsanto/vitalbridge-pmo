"use client";

import { useActionState, useState } from "react";
import { addMeeting, addTodo } from "@/app/(app)/todos/actions";
import { addDependencyFromCalendar } from "@/app/(app)/calendar/actions";
import type { HospitalOption } from "./types";

type Kind = "meeting" | "todo" | "dependency";

const FIELD = "w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";
const BTN = "w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";
const LABEL = "mb-1 block text-xs font-medium";
const ERROR = "text-sm font-medium text-rose-600";

const TABS: { kind: Kind; label: string }[] = [
  { kind: "meeting", label: "Meeting" },
  { kind: "todo", label: "To-do" },
  { kind: "dependency", label: "Dependency" },
];

/** Owner-only quick add for the selected day. Date fields start on that day. */
export function DayForms({ day, hospitals }: { day: string; hospitals: HospitalOption[] }) {
  const [kind, setKind] = useState<Kind>("meeting");
  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <div role="tablist" aria-label="Add to this day" className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-[var(--track)] p-1">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            role="tab"
            aria-selected={kind === t.kind}
            onClick={() => setKind(t.kind)}
            className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              kind === t.kind ? "bg-[var(--accent)] text-white shadow" : "text-[var(--text)] hover:bg-white/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {kind === "meeting" && <MeetingForm day={day} />}
      {kind === "todo" && <TodoForm day={day} />}
      {kind === "dependency" && <DependencyForm day={day} hospitals={hospitals} />}
    </div>
  );
}

function MeetingForm({ day }: { day: string }) {
  const [state, action, pending] = useActionState(addMeeting, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="cal-m-title" className={LABEL}>Meeting title</label>
        <input id="cal-m-title" name="title" required className={FIELD} />
      </div>
      <div>
        <label htmlFor="cal-m-start" className={LABEL}>Starts at</label>
        <input id="cal-m-start" name="starts_at" type="datetime-local" defaultValue={`${day}T09:00`} required className={FIELD} />
      </div>
      <button type="submit" disabled={pending} className={BTN}>Add meeting</button>
      {state?.error && <p role="alert" className={ERROR}>{state.error}</p>}
    </form>
  );
}

function TodoForm({ day }: { day: string }) {
  const [state, action, pending] = useActionState(addTodo, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="cal-t-title" className={LABEL}>To-do title</label>
        <input id="cal-t-title" name="title" required className={FIELD} />
      </div>
      <div>
        <label htmlFor="cal-t-due" className={LABEL}>Due date</label>
        <input id="cal-t-due" name="due_date" type="date" defaultValue={day} className={FIELD} />
      </div>
      <button type="submit" disabled={pending} className={BTN}>Add to-do</button>
      {state?.error && <p role="alert" className={ERROR}>{state.error}</p>}
    </form>
  );
}

function DependencyForm({ day, hospitals }: { day: string; hospitals: HospitalOption[] }) {
  const [state, action, pending] = useActionState(addDependencyFromCalendar, undefined);
  if (hospitals.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Add a hospital first: every dependency belongs to one.</p>;
  }
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="cal-d-title" className={LABEL}>Dependency title</label>
        <input id="cal-d-title" name="title" required className={FIELD} />
      </div>
      <div>
        <label htmlFor="cal-d-hospital" className={LABEL}>Hospital</label>
        <select id="cal-d-hospital" name="project_id" defaultValue={hospitals[0].id} className={FIELD}>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cal-d-type" className={LABEL}>Type</label>
          <select id="cal-d-type" name="type" defaultValue="license" className={FIELD}>
            <option value="license">License</option>
            <option value="dea">DEA</option>
            <option value="340b">340B</option>
            <option value="payer">Payer contract</option>
            <option value="accreditation">Accreditation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="cal-d-due" className={LABEL}>Due date</label>
          <input id="cal-d-due" name="due_date" type="date" defaultValue={day} required className={FIELD} />
        </div>
      </div>
      <button type="submit" disabled={pending} className={BTN}>Add dependency</button>
      {state?.error && <p role="alert" className={ERROR}>{state.error}</p>}
    </form>
  );
}
