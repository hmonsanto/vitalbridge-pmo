"use client";
import { motion } from "framer-motion";

export function Card({ title, children, delay = 0, className = "" }: { title?: string; children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm backdrop-blur ${className}`}
    >
      {title && <h2 className="mb-3 text-sm font-semibold text-[var(--heading)]">{title}</h2>}
      {children}
    </motion.section>
  );
}
