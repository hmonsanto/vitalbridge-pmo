import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export type MajorRisk = { id: string; title: string; severity: "high" | "critical"; project: string };

export function MajorRisks({ risks }: { risks: MajorRisk[] }) {
  const sorted = [...risks].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1));
  return (
    <Card title="Major risks" delay={0.2}>
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No major risks. Nothing high or critical is open.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">{r.title}</span>
                <span className="ml-2 text-xs text-[var(--muted)]">{r.project}</span>
              </span>
              <Badge tone={r.severity === "critical" ? "danger" : "warn"}>{r.severity}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
