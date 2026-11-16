"use client";
import { motion } from "framer-motion";

/** Fades and slides the grid in whenever the visible month changes. */
export function MonthTransition({ monthKey, children }: { monthKey: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={monthKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
