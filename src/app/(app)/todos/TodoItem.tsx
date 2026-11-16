"use client";

import { useState, useTransition } from "react";
import { toggleTodo } from "./actions";

export function TodoItem({ id, title, dueDate, done, editable }: { id: string; title: string; dueDate: string | null; done: boolean; editable: boolean }) {
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
      />
      <span className={checked ? "text-[var(--muted)] line-through" : ""}>{title}</span>
      {dueDate && <span className="text-xs text-[var(--muted)]">due {dueDate}</span>}
    </li>
  );
}
