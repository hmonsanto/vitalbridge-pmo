"use client";

import { useActionState } from "react";
import { addTodo, addMeeting } from "./actions";

const FIELD = "rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";
const BTN = "rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";

export function AddTodoForm() {
  const [state, action, pending] = useActionState(addTodo, undefined);
  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="t-title" className="text-xs font-medium">To-do title</label>
        <input id="t-title" name="title" required className={FIELD} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="t-due" className="text-xs font-medium">Due date</label>
        <input id="t-due" name="due_date" type="date" className={FIELD} />
      </div>
      <button type="submit" disabled={pending} className={BTN}>Add to-do</button>
      {state?.error && <p role="alert" className="w-full text-sm font-medium text-rose-600">{state.error}</p>}
    </form>
  );
}

export function AddMeetingForm() {
  const [state, action, pending] = useActionState(addMeeting, undefined);
  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3 border-t border-[var(--border)] pt-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="m-title" className="text-xs font-medium">Meeting title</label>
        <input id="m-title" name="title" required className={FIELD} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="m-start" className="text-xs font-medium">Starts at</label>
        <input id="m-start" name="starts_at" type="datetime-local" required className={FIELD} />
      </div>
      <button type="submit" disabled={pending} className={BTN}>Add meeting</button>
      {state?.error && <p role="alert" className="w-full text-sm font-medium text-rose-600">{state.error}</p>}
    </form>
  );
}
