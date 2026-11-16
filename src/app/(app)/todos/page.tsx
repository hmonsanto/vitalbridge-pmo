import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { TodoItem } from "./TodoItem";
import { AddTodoForm, AddMeetingForm } from "./TodoForms";

export default async function TodosPage() {
  const supabase = await createClient();
  const editable = (await getSessionRole()) === "owner";

  const [todos, meetings] = await Promise.all([
    supabase.from("todos").select("id, title, due_date, done").order("done").order("due_date", { nullsFirst: false }),
    supabase.from("meetings").select("id, title, starts_at").order("starts_at"),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--heading)]">To-Do and meetings</h2>

      <Card title="To-Do">
        {(todos.data ?? []).length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing to do.</p>
        ) : (
          <ul className="space-y-2">
            {todos.data!.map((t) => (
              <TodoItem key={t.id} id={t.id} title={t.title} dueDate={t.due_date} done={t.done} editable={editable} />
            ))}
          </ul>
        )}
        {editable && <AddTodoForm />}
      </Card>

      <Card title="Meetings" delay={0.1}>
        {(meetings.data ?? []).length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No meetings scheduled.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {meetings.data!.map((m) => (
              <li key={m.id}>
                <span className="font-medium">{m.title}</span>
                <span className="ml-2 text-xs text-[var(--muted)]">{new Date(m.starts_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        {editable && <AddMeetingForm />}
      </Card>
    </div>
  );
}
