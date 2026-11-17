import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { canEdit } from "@/domain/roles";
import type { GateDecision } from "@/domain/gates";
import { HospitalView } from "./HospitalView";

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

  const [phases, gates, deliverables, risks, dependencies, baseline] = await Promise.all([
    supabase.from("phases").select("number, name").order("number"),
    supabase.from("gates").select("code, decision").eq("project_id", id),
    supabase.from("deliverables").select("id, phase, name, owner, status, doc_url, remarks").eq("project_id", id).order("phase"),
    supabase.from("risks").select("id, title, severity, owner, status").eq("project_id", id).order("title"),
    supabase.from("dependencies").select("id, title, type, due_date, status").eq("project_id", id).order("due_date"),
    supabase.from("baseline_entries").select("id, month, baseline, actual").eq("project_id", id).order("month"),
  ]);

  const gateByPhase: Record<number, GateDecision> = {};
  for (const g of gates.data ?? []) {
    if (g.decision) gateByPhase[Number(g.code.slice(1))] = g.decision as GateDecision;
  }

  return (
    <HospitalView
      project={project}
      phaseNames={(phases.data ?? []).map((p) => p.name)}
      gateByPhase={gateByPhase}
      deliverables={deliverables.data ?? []}
      baseline={baseline.data ?? []}
      risks={risks.data ?? []}
      dependencies={dependencies.data ?? []}
      canEdit={canEdit(role)}
    />
  );
}
