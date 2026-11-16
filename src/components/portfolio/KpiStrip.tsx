import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";

type Props = { hospitals: number; gatesPending: number; openRisks: number; overdueDependencies: number };

export function KpiStrip({ hospitals, gatesPending, openRisks, overdueDependencies }: Props) {
  const items = [
    { id: "kpi-hospitals", label: "Hospitals", value: hospitals },
    { id: "kpi-gates", label: "Gates pending", value: gatesPending },
    { id: "kpi-risks", label: "Open risks", value: openRisks },
    { id: "kpi-overdue", label: "Overdue dependencies", value: overdueDependencies },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((k, i) => (
        <Card key={k.id} delay={i * 0.06}>
          <div data-testid={k.id} data-value={k.value}>
            <p className="text-xs font-medium text-[var(--muted)]">{k.label}</p>
            <p className="mt-1 text-3xl font-bold text-[var(--heading)]">
              <CountUp value={k.value} />
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
