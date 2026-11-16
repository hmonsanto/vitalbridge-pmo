import { Badge, type BadgeTone } from "./Badge";

const MAP: Record<string, { tone: BadgeTone; label: string }> = {
  completed: { tone: "ok", label: "Completed" },
  in_progress: { tone: "warn", label: "In progress" },
  blocked: { tone: "danger", label: "Blocked" },
  not_started: { tone: "info", label: "Not started" },
};

/** Colored status pill for deliverables (amber in progress, green completed, red blocked). */
export function StatusPill({ status }: { status: string }) {
  const s = MAP[status] ?? { tone: "info" as const, label: status };
  return <Badge tone={s.tone} pulse={status === "blocked"}>{s.label}</Badge>;
}
