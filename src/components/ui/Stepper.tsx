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
    <ol className="flex w-full items-start gap-2" aria-label="Project phases">
      {phases.map((name, i) => {
        const n = i + 1;
        const state = n < current ? "complete" : n === current ? "current" : "upcoming";
        const gate = gates[n];
        return (
          <li
            key={name}
            data-state={state}
            data-gate={gate}
            aria-current={state === "current" ? "step" : undefined}
            className="flex flex-1 flex-col gap-2"
          >
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: state === "complete" ? "100%" : state === "current" ? "50%" : "0%" }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--text)]">{n}. {name}</span>
            {gate && <span className="text-[11px] text-[var(--muted)]">G{n}: {GATE_LABEL[gate]}</span>}
          </li>
        );
      })}
    </ol>
  );
}
