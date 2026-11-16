"use client";

import { useState, useTransition } from "react";
import { toggleTodo } from "@/app/(app)/todos/actions";

type Props = { id: string; title: string; dueDate: string | null; done: boolean; overdue?: boolean; editable: boolean };

/** One to-do with a checkbox. The tick shows immediately; the server confirms in the background. */
export function TodoItem({ id, title, dueDate, done, overdue = false, editable }: Props) {
  const [checked, setChecked] = useState(done);
  const [, start] = useTransition();
  return (
    <li className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        aria-label={`Complete ${title}`}
        checked={checked}
        disabled={!editable}
        onChange={(e) => {
          setChecked(e.target.checked);
          start(() => void toggleTodo(id, e.target.checked));
        }}
        className="h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <span className={`min-w-0 flex-1 ${checked ? "text-[var(--muted)] line-through" : ""}`}>{title}</span>
      {dueDate && (
        <span className={`shrink-0 text-xs ${overdue && !checked ? "font-semibold text-rose-600" : "text-[var(--muted)]"}`}>
          {dueDate}
        </span>
      )}
    </li>
  );
}
