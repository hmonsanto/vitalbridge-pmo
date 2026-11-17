import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { DeleteHospitalForm, EditHospitalForm } from "@/components/edit/EditForms";
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
  canEdit: boolean;
};

/** Pure view of one hospital: no data fetching, so it can be previewed and tested with plain data. */
export function HospitalView({ project, phaseNames, gateByPhase, deliverables, baseline, risks, dependencies, canEdit }: HospitalViewData) {
  const id = project.id;
  const phase = project.current_phase;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--heading)]">{project.name}</h2>
        <Badge tone="info">Scenario {project.scenario}</Badge>
        {canEdit && (
          <span className="flex items-center gap-0.5">
            <Dialog icon="edit" triggerLabel="Edit hospital" title="Edit hospital">
              <EditHospitalForm projectId={id} name={project.name} scenario={project.scenario} />
            </Dialog>
            <Dialog icon="delete" triggerLabel="Delete hospital" title="Delete hospital">
              <DeleteHospitalForm projectId={id} name={project.name} />
            </Dialog>
          </span>
        )}
      </div>

      <Card title="Phases and gates">
        <Stepper phases={phaseNames} current={phase} gates={gateByPhase} />
        {canEdit && phase <= 5 && <GateDecisionForm projectId={id} phase={phase} />}
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_410px]">
        <div>
          <Card title="Deliverables" delay={0.1}>
            <DeliverablesTable projectId={id} rows={deliverables} editable={canEdit} />
            {canEdit && <AddDeliverableForm projectId={id} />}
          </Card>
        </div>
        <BaselinePanel projectId={id} rows={baseline} editable={canEdit} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RisksCard projectId={id} risks={risks} editable={canEdit} />
        <DependenciesCard projectId={id} dependencies={dependencies} editable={canEdit} />
      </div>
    </div>
  );
}
