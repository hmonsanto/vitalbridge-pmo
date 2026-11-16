import { createClient } from "@/lib/supabase/server";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

type Named = { id: string; name: string } | null;

export default async function PortfolioPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [hospitals, gates, risks, overdue, major, todos, meetings, deliverables] = await Promise.all([
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
    supabase
      .from("deliverables")
      .select("id, name, phase, owner, status, projects(id, name)")
      .neq("status", "completed")
      .order("phase")
      .limit(8),
  ]);

  return (
    <PortfolioView
      kpis={{
        hospitals: hospitals.count ?? 0,
        gatesPending: gates.count ?? 0,
        openRisks: risks.count ?? 0,
        overdueDependencies: overdue.count ?? 0,
      }}
      majorRisks={(major.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        severity: r.severity as "high" | "critical",
        project: (r.projects as unknown as { name: string } | null)?.name ?? "",
      }))}
      todos={todos.data ?? []}
      meetings={meetings.data ?? []}
      deliverables={(deliverables.data ?? []).map((d) => {
        const p = d.projects as unknown as Named;
        return {
          id: d.id,
          name: d.name,
          phase: d.phase,
          owner: d.owner,
          status: d.status,
          hospital: p?.name ?? "",
          hospitalId: p?.id ?? "",
        };
      })}
    />
  );
}
