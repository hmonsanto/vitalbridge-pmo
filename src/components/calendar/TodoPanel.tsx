import { Card } from "@/components/ui/Card";
import { isOverdue } from "@/domain/dependencies";
import { AddUndatedTodo } from "./AddUndatedTodo";
import { TodoItem } from "./TodoItem";

export type TodoRow = { id: string; title: string; due_date: string | null; done: boolean };

/** Every to-do, dated or not: the calendar only shows the dated ones on their day. */
export function TodoPanel({ todos, isOwner }: { todos: TodoRow[]; isOwner: boolean }) {
  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);
  return (
    <Card title="To-do" delay={0.08}>
      {open.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nothing to do.</p>
      ) : (
        <ul aria-label="To-do list" className="space-y-2">
          {open.map((t) => (
            <TodoItem
              key={t.id}
              id={t.id}
              title={t.title}
              dueDate={t.due_date}
              done={false}
              overdue={t.due_date ? isOverdue(t.due_date, "open") : false}
              editable={isOwner}
            />
          ))}
        </ul>
      )}

      {isOwner && <AddUndatedTodo />}

      {done.length > 0 && (
        <details className="mt-3 border-t border-[var(--border)] pt-3">
          <summary className="cursor-pointer text-xs font-semibold text-[var(--muted)]">Completed ({done.length})</summary>
          <ul aria-label="Completed to-dos" className="mt-2 space-y-2">
            {done.map((t) => (
              <TodoItem key={t.id} id={t.id} title={t.title} dueDate={t.due_date} done editable={isOwner} />
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
