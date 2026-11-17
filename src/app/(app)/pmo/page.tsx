import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { canEdit } from "@/domain/roles";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DeliverablesTable } from "@/app/(app)/hospitals/[id]/DeliverablesTable";
import { AddDeliverableForm } from "@/app/(app)/hospitals/[id]/AddDeliverableForm";
import { RisksCard } from "@/app/(app)/hospitals/[id]/RisksCard";
import { PmoGateForm } from "./PmoGateForm";
import { PMO_GATES } from "@/domain/gates";
import { createPmoProject } from "./actions";

const LABEL: Record<string, string> = {
  go: "Go",
  go_with_conditions: "Go with conditions",
  replan: "Re-plan",
  stop: "Stop",
};
const TONE = { go: "ok", go_with_conditions: "warn", replan: "warn", stop: "danger" } as const;

export default async function PmoPage() {
  const supabase = await createClient();
  const mayEdit = canEdit(await getSessionRole());

  const { data: project } = await supabase.from("projects").select("id, name").eq("kind", "pmo").maybeSingle();
  if (!project) {
    return (
      <Card title="PMO workstream">
        <p className="text-sm text-[var(--muted)]">The PMO workstream has not been created yet.</p>
        {mayEdit && (
          <form action={createPmoProject} className="mt-3">
            <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
              Create PMO workstream
            </button>
          </form>
        )}
      </Card>
    );
  }

  const [gates, deliverables, risks] = await Promise.all([
    supabase.from("gates").select("code, decision, decided_on, notes").eq("project_id", project.id),
    supabase.from("deliverables").select("id, phase, name, owner, status, doc_url, remarks").eq("project_id", project.id).order("phase"),
    supabase.from("risks").select("id, title, severity, owner, status").eq("project_id", project.id).order("title"),
  ]);
  const byCode = new Map((gates.data ?? []).map((g) => [g.code, g]));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--heading)]">{project.name}</h2>

      <Card title="PMO gates">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PMO_GATES.map((code) => {
            const g = byCode.get(code);
            return (
              <li key={code} data-testid={`gate-${code}`} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                <span className="font-semibold">{code}</span>
                {g?.decision ? (
                  <Badge tone={TONE[g.decision as keyof typeof TONE]}>{LABEL[g.decision]}</Badge>
                ) : (
                  <Badge tone="info">Pending</Badge>
                )}
              </li>
            );
          })}
        </ul>
        {mayEdit && <PmoGateForm projectId={project.id} />}
      </Card>

      <Card title="Deliverables" delay={0.1}>
        <DeliverablesTable projectId={project.id} rows={deliverables.data ?? []} editable={mayEdit} />
        {mayEdit && <AddDeliverableForm projectId={project.id} />}
      </Card>

      <RisksCard projectId={project.id} risks={risks.data ?? []} editable={mayEdit} />
    </div>
  );
}
