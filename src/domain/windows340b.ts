const WINDOW_MONTHS = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct (0-indexed)

export type Window340b = { start: Date; end: Date; isOpen: boolean };

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

/** 340B registration windows: 1st–15th (inclusive) of Jan, Apr, Jul, Oct. */
export function next340bWindow(from: Date): Window340b {
  const day = utc(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  for (const year of [from.getUTCFullYear(), from.getUTCFullYear() + 1]) {
    for (const month of WINDOW_MONTHS) {
      const start = utc(year, month, 1);
      const end = utc(year, month, 15);
      if (day <= end) return { start, end, isOpen: day >= start };
    }
  }
  throw new Error("unreachable");
}
