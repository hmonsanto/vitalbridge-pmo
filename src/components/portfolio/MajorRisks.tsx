"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export type MajorRisk = { id: string; title: string; severity: "high" | "critical"; project: string };

export function MajorRisks({ risks }: { risks: MajorRisk[] }) {
  const sorted = [...risks].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1));
  return (
    <Card title="Major issues" delay={0.2}>
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No major risks. Nothing high or critical is open.</p>
      ) : (
        <ul className="space-y-1">
          {sorted.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="row-hover grid grid-cols-[auto_1fr] items-start gap-3 rounded-lg px-2 py-2 text-sm"
            >
              <Badge tone={r.severity === "critical" ? "danger" : "warn"} pulse={r.severity === "critical"}>
                {r.severity === "critical" ? "Critical" : "High"}
              </Badge>
              <span>
                <span className="block font-medium text-[var(--text)]">{r.title}</span>
                <span className="mt-0.5 inline-block rounded-full bg-[#f9b9b9] px-2 py-0.5 text-[10px] font-semibold text-[#7f1d1d] dark:bg-rose-900/50 dark:text-rose-200">
                  {r.project}
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
