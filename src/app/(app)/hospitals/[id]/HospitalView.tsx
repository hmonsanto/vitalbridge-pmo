import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import type { GateDecision } from "@/domain/gates";
import { AddDeliverableForm } from "./AddDeliverableForm";
import { BaselinePanel, type BaselineRow } from "./BaselinePanel";
import { DeliverablesTable, type DeliverableRow } from "./DeliverablesTable";
import { DependenciesCard, type DependencyRow } from "./DependenciesCard";
import { GateDecisionForm } from "./GateDecisionForm";
import { RisksCard, type RiskRow } from "./RisksCard";

export type HospitalViewData = {
  project: { id: string; name: string; scenario: string | null; current_phase: number };
  phaseNames: string[];
  gateByPhase: Record<number, GateDecision>;
  deliverables: DeliverableRow[];
  baseline: BaselineRow[];
  risks: RiskRow[];
  dependencies: DependencyRow[];
  isOwner: boolean;
};

/** Pure view of one hospital: no data fetching, so it can be previewed and tested with plain data. */
export function HospitalView({ project, phaseNames, gateByPhase, deliverables, baseline, risks, dependencies, isOwner }: HospitalViewData) {
  const id = project.id;
  const phase = project.current_phase;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--heading)]">{project.name}</h2>
        <Badge tone="info">Scenario {project.scenario}</Badge>
      </div>

      <Card title="Phases and gates">
        <Stepper phases={phaseNames} current={phase} gates={gateByPhase} />
        {isOwner && phase <= 5 && <GateDecisionForm projectId={id} phase={phase} />}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Deliverables" delay={0.1}>
            <DeliverablesTable projectId={id} rows={deliverables} editable={isOwner} />
            {isOwner && <AddDeliverableForm projectId={id} />}
          </Card>
        </div>
        <BaselinePanel projectId={id} rows={baseline} editable={isOwner} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RisksCard projectId={id} risks={risks} editable={isOwner} />
        <DependenciesCard projectId={id} dependencies={dependencies} editable={isOwner} />
      </div>
    </div>
  );
}
