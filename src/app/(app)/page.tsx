import { createClient } from "@/lib/supabase/server";
import { KpiStrip } from "@/components/portfolio/KpiStrip";
import { MajorRisks, type MajorRisk } from "@/components/portfolio/MajorRisks";
import { Card } from "@/components/ui/Card";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [hospitals, gates, risks, overdue, major, todos, meetings] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("kind", "hospital"),
    supabase.from("gates").select("id", { count: "exact", head: true }).is("decision", null),
    supabase.from("risks").select("id", { count: "exact", head: true }).neq("status", "closed"),
    supabase.from("dependencies").select("id", { count: "exact", head: true }).lt("due_date", today).neq("status", "done"),
    supabase
      .from("risks")
      .select("id, title, severity, projects(name)")
      .neq("status", "closed")
      .in("severity", ["high", "critical"]),
    supabase.from("todos").select("id, title, due_date").eq("done", false).order("due_date").limit(5),
    supabase.from("meetings").select("id, title, starts_at").gte("starts_at", new Date().toISOString()).order("starts_at").limit(5),
  ]);

  const majorRisks: MajorRisk[] = (major.data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    severity: r.severity as "high" | "critical",
    project: (r.projects as unknown as { name: string } | null)?.name ?? "",
  }));

  return (
    <div className="space-y-4">
      <KpiStrip
        hospitals={hospitals.count ?? 0}
        gatesPending={gates.count ?? 0}
        openRisks={risks.count ?? 0}
        overdueDependencies={overdue.count ?? 0}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <MajorRisks risks={majorRisks} />
        <Card title="Up next" delay={0.25}>
          {(todos.data ?? []).length + (meetings.data ?? []).length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Nothing scheduled.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(meetings.data ?? []).map((m) => (
                <li key={m.id}>
                  <span className="font-medium">{m.title}</span>
                  <span className="ml-2 text-xs text-[var(--muted)]">{new Date(m.starts_at).toLocaleString()}</span>
                </li>
              ))}
              {(todos.data ?? []).map((t) => (
                <li key={t.id}>
                  {t.title}
                  {t.due_date && <span className="ml-2 text-xs text-[var(--muted)]">due {t.due_date}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
