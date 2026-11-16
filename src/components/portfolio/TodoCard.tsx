import Link from "next/link";
import { ArrowRight, Circle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export type TodoItem = { id: string; title: string; due_date: string | null };

export function TodoCard({ todos }: { todos: TodoItem[] }) {
  return (
    <Card
      title="To-Do"
      delay={0.1}
      action={
        <Link href="/todos" className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline">
          All <ArrowRight size={13} />
        </Link>
      }
    >
      {todos.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nothing to do.</p>
      ) : (
        <ul className="space-y-1">
          {todos.map((t, i) => (
            <li key={t.id} className="row-hover grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
              <Circle size={14} className="text-[var(--muted)]" />
              <span className="truncate">{t.title}</span>
              <span className="text-xs text-[var(--muted)]">{t.due_date ?? `#${i + 1}`}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
