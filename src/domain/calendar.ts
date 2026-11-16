/** Calendar math on plain "YYYY-MM-DD" strings, always in UTC so results never depend on the server's time zone. */

export type YearMonth = { year: number; month: number }; // month is 1-12
export type DayCell = { date: string; inMonth: boolean };

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => d.toISOString().slice(0, 10);

export const monthKey = ({ year, month }: YearMonth): string => `${year}-${pad(month)}`;

/** Reads a "YYYY-MM" query value; anything missing or invalid falls back to the current month. */
export function parseMonth(param: string | undefined, today: Date = new Date()): YearMonth {
  const match = /^(\d{4})-(\d{2})$/.exec(param ?? "");
  if (match) {
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year: Number(match[1]), month };
  }
  return { year: today.getUTCFullYear(), month: today.getUTCMonth() + 1 };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** The weeks that cover a month, padded with days of the neighbouring months. */
export function monthGrid(ym: YearMonth, weekStartsOn: 0 | 1 = 1): DayCell[][] {
  const first = new Date(Date.UTC(ym.year, ym.month - 1, 1));
  const offset = (first.getUTCDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(Date.UTC(ym.year, ym.month, 0)).getUTCDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const prefix = monthKey(ym);

  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = iso(new Date(Date.UTC(ym.year, ym.month - 1, 1 - offset + w * 7 + d)));
      return { date, inMonth: date.startsWith(prefix) };
    }),
  );
}

/** 340B registrations are accepted only from the 1st to the 15th of January, April, July and October. */
export function is340bDay(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const month = Number(match[2]);
  return [1, 4, 7, 10].includes(month) && Number(match[3]) <= 15;
}

/** A valid calendar date, or null (rejects "2027-02-30" and malformed input). */
export function parseDay(param: string | undefined): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param ?? "");
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return iso(date) === param ? (param as string) : null;
}

export function groupByDay<T extends { date: string }>(events: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const event of events) (grouped[event.date] ??= []).push(event);
  return grouped;
}
