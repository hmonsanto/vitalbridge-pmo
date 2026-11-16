"use client";

import { motion } from "framer-motion";

/** Overall completion: share of deliverables marked completed across all projects. */
export function CompletionCard({ percent, done, total }: { percent: number; done: number; total: number }) {
  return (
    <div className="glass-card min-w-56 px-4 py-3" aria-label="Overall completion">
      <div className="flex items-baseline justify-between gap-4 text-xs">
        <span className="font-medium text-[var(--muted)]">Overall completion</span>
        <span data-testid="completion" className="text-base font-bold text-[var(--heading)]">{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--track)]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--muted)]">
        {done} of {total} deliverables completed
      </p>
    </div>
  );
}
