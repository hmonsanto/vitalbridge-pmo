export const FEE_RATE = 0.3;

export type BaselineEntry = { baseline: number; actual: number };

/** Fee is 30% of monthly incremental gross profit over baseline; months below baseline owe nothing. */
export function calcFee(entries: BaselineEntry[]): { incremental: number; fee: number } {
  const incremental = entries.reduce((sum, e) => sum + Math.max(0, e.actual - e.baseline), 0);
  const fee = Math.round(incremental * FEE_RATE * 100) / 100;
  return { incremental, fee };
}
