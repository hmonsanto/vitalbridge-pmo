"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { GateDecision } from "@/domain/gates";

const GATE_LABEL: Record<GateDecision, string> = {
  go: "Go",
  go_with_conditions: "Go with conditions",
  replan: "Re-plan",
  stop: "Stop",
};

export function Stepper({
  phases,
  current,
  gates = {},
}: {
  phases: string[];
  current: number;
  gates?: Record<number, GateDecision>;
}) {
  return (
    <ol className="grid w-full gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Project phases">
      {phases.map((name, i) => {
        const n = i + 1;
        const state = n < current ? "complete" : n === current ? "current" : "upcoming";
        const gate = gates[n];
        const width = state === "complete" ? "100%" : state === "current" ? "50%" : "0%";
        return (
          <motion.li
            key={name}
            data-state={state}
            data-gate={gate}
            aria-current={state === "current" ? "step" : undefined}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="flex flex-col gap-2"
          >
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
              <motion.div
                className="bar-fill h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--heading)]">
              {state === "complete" && <Check size={13} className="text-emerald-500" />}
              {n}. {name}
            </span>
            {gate && <span className="text-[11px] text-[var(--muted)]">G{n}: {GATE_LABEL[gate]}</span>}
          </motion.li>
        );
      })}
    </ol>
  );
}
