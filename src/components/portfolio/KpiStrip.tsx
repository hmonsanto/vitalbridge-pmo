"use client";

import { AlertTriangle, Building2, Flag, Hourglass } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

type Props = { hospitals: number; gatesPending: number; openRisks: number; overdueDependencies: number };

export function KpiStrip({ hospitals, gatesPending, openRisks, overdueDependencies }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard testId="kpi-hospitals" title="Hospitals" value={hospitals} icon={Building2} gradient="grad-burgundy" />
      <StatCard testId="kpi-gates" title="Gates pending" value={gatesPending} icon={Flag} gradient="grad-gold" delay={0.06} />
      <StatCard testId="kpi-risks" title="Open risks" value={openRisks} icon={AlertTriangle} gradient="grad-terracotta" delay={0.12} />
      <StatCard testId="kpi-overdue" title="Overdue dependencies" value={overdueDependencies} icon={Hourglass} gradient="grad-charcoal" delay={0.18} />
    </div>
  );
}
