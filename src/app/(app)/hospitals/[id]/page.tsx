import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import type { GateDecision } from "@/domain/gates";
import { DeliverablesTable } from "./DeliverablesTable";
import { AddDeliverableForm } from "./AddDeliverableForm";
import { GateDecisionForm } from "./GateDecisionForm";

export default async function HospitalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, scenario, current_phase")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [phases, gates, deliverables] = await Promise.all([
    supabase.from("phases").select("number, name").order("number"),
    supabase.from("gates").select("code, decision").eq("project_id", id),
    supabase.from("deliverables").select("id, phase, name, owner, status, doc_url, remarks").eq("project_id", id).order("phase"),
  ]);

  const gateByPhase: Record<number, GateDecision> = {};
  for (const g of gates.data ?? []) {
    if (g.decision) gateByPhase[Number(g.code.slice(1))] = g.decision as GateDecision;
  }

  const isOwner = role === "owner";
  const phase = project.current_phase as number;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[var(--heading)]">{project.name}</h2>
        <Badge tone="info">Scenario {project.scenario}</Badge>
      </div>

      <Card title="Phases and gates">
        <Stepper phases={(phases.data ?? []).map((p) => p.name)} current={phase} gates={gateByPhase} />
        {isOwner && phase <= 5 && <GateDecisionForm projectId={id} phase={phase} />}
      </Card>

      <Card title="Deliverables" delay={0.1}>
        <DeliverablesTable projectId={id} rows={deliverables.data ?? []} editable={isOwner} />
        {isOwner && <AddDeliverableForm projectId={id} />}
      </Card>
    </div>
  );
}
