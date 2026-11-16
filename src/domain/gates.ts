export type GateDecision = "go" | "go_with_conditions" | "replan" | "stop";
export const LAST_PHASE = 6;

/** A project may leave a phase only after a Go or Go-with-conditions gate decision. */
export function canAdvance(phase: number, decision: GateDecision | null): boolean {
  if (phase >= LAST_PHASE) return false;
  return decision === "go" || decision === "go_with_conditions";
}
export const PMO_GATES = ["G0", "G1", "G2", "G3", "G4", "G5"] as const;
