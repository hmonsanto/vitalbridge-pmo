import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { isOverdue } from "@/domain/dependencies";
import { next340bWindow } from "@/domain/windows340b";

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export default async function CalendarPage() {
  const supabase = await createClient();
  const window340b = next340bWindow(new Date());
  const { data: deps } = await supabase
    .from("dependencies")
    .select("id, title, type, due_date, status, projects(name)")
    .neq("status", "done")
    .order("due_date");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--heading)]">Calendar</h2>

      <Card title="340B registration window">
        <p className="text-sm">
          {fmt(window340b.start)} to {fmt(window340b.end)}{" "}
          <Badge tone={window340b.isOpen ? "ok" : "warn"}>
            {window340b.isOpen ? "Open now" : `Opens ${fmt(window340b.start)}`}
          </Badge>
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          New 340B registrations are accepted only from the 1st to the 15th of January, April, July and October.
        </p>
      </Card>

      <Card title="Dependency deadlines" delay={0.1}>
        {(deps ?? []).length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No open dependencies.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {deps!.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3">
                <span>
                  <span className="font-medium">{d.title}</span>
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    {(d.projects as unknown as { name: string } | null)?.name} · {d.type}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs">{d.due_date}</span>
                  {isOverdue(d.due_date, d.status) && <Badge tone="danger">Overdue</Badge>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
