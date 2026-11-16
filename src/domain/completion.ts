/** Share of deliverables marked completed, as a whole percentage (0 when there are none). */
export function completionRate(statuses: string[]): number {
  if (statuses.length === 0) return 0;
  const done = statuses.filter((s) => s === "completed").length;
  return Math.round((done / statuses.length) * 100);
}
