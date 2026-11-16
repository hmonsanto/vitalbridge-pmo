"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { CountUp } from "./CountUp";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  title: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  /** Brand gradient class for the icon chip: grad-burgundy, grad-gold, grad-charcoal or grad-terracotta. */
  gradient: string;
  testId?: string;
  delay?: number;
};

/** KPI tile: glass surface that lifts on hover, with a gradient icon chip and an animated number. */
export function StatCard({ title, value, hint, icon: Icon, gradient, testId, delay = 0 }: Props) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      data-testid={testId}
      data-value={value}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduced ? undefined : { y: -5 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card cursor-default p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--muted)]">{title}</p>
          <p className="font-display mt-1 text-4xl font-bold text-[var(--heading)]">
            <CountUp value={value} />
          </p>
          {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl text-white shadow-lg ${gradient}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
    </motion.div>
  );
}
