"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export type ActiveDeliverable = {
  id: string;
  name: string;
  hospital: string;
  hospitalId: string;
  phase: number;
  owner: string | null;
  status: string;
};

/** Cross-hospital deliverable table (the "requirement table" of the reference). */
export function ActiveDeliverables({ rows }: { rows: ActiveDeliverable[] }) {
  return (
    <Card title="Active deliverables" delay={0.25}>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No open deliverables.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="py-2 pr-3">Phase</th>
                <th className="pr-3">Name</th>
                <th className="pr-3">Hospital</th>
                <th className="pr-3">Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="row-hover border-t border-[var(--border)]"
                >
                  <td className="py-2 pr-3 text-[var(--muted)]">{r.phase}</td>
                  <td className="pr-3 font-medium">{r.name}</td>
                  <td className="pr-3">
                    <Link href={`/hospitals/${r.hospitalId}`} className="text-[var(--link)] hover:underline">
                      {r.hospital}
                    </Link>
                  </td>
                  <td className="pr-3">{r.owner ?? "—"}</td>
                  <td><StatusPill status={r.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
