"use client";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Raise the card slightly on hover (for navigable or glanceable cards, not for forms). */
  lift?: boolean;
};

export function Card({ title, action, children, delay = 0, className = "", lift = false }: Props) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={lift && !reduced ? { y: -5 } : undefined}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-bold text-[var(--heading)]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
