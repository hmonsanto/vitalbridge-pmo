import { KpiStrip } from "./KpiStrip";
import { MajorRisks, type MajorRisk } from "./MajorRisks";
import { TodoCard, type TodoItem } from "./TodoCard";
import { MeetingsCard, type MeetingItem } from "./MeetingsCard";
import { ActiveDeliverables, type ActiveDeliverable } from "./ActiveDeliverables";

export type PortfolioData = {
  kpis: { hospitals: number; gatesPending: number; openRisks: number; overdueDependencies: number };
  majorRisks: MajorRisk[];
  todos: TodoItem[];
  meetings: MeetingItem[];
  deliverables: ActiveDeliverable[];
};

/** Pure view: renders the portfolio from plain data (no fetching), so it is easy to preview and test. */
export function PortfolioView({ kpis, majorRisks, todos, meetings, deliverables }: PortfolioData) {
  return (
    <div className="space-y-4">
      <KpiStrip {...kpis} />
      <div className="grid gap-4 lg:grid-cols-3">
        <TodoCard todos={todos} />
        <MeetingsCard meetings={meetings} />
        <MajorRisks risks={majorRisks} />
      </div>
      <ActiveDeliverables rows={deliverables} />
    </div>
  );
}
