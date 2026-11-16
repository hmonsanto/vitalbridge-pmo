import Link from "next/link";
import { is340bDay, type DayCell } from "@/domain/calendar";
import { EventChip } from "./EventChip";
import { MonthTransition } from "./MonthTransition";
import type { CalendarEvent } from "./types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_CHIPS = 3;

type Props = {
  monthKey: string;
  weeks: DayCell[][];
  eventsByDay: Record<string, CalendarEvent[]>;
  today: string;
  selected: string | null;
};

/** Month view. Every day is a link (`?m=…&d=…`), so selecting a day needs no client state. */
export function MonthGrid({ monthKey, weeks, eventsByDay, today, selected }: Props) {
  return (
    <div className="glass-card p-3">
      <div className="mb-1 grid grid-cols-7 gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {WEEKDAYS.map((d) => (
          <span key={d} className="px-1">{d}</span>
        ))}
      </div>
      <MonthTransition monthKey={monthKey}>
        <div className="grid gap-1.5">
          {weeks.map((week) => (
            <div key={week[0].date} className="grid grid-cols-7 gap-1.5">
              {week.map(({ date, inMonth }) => {
                const events = eventsByDay[date] ?? [];
                const window340b = is340bDay(date);
                const isToday = date === today;
                const isSelected = date === selected;
                return (
                  <Link
                    key={date}
                    href={`/calendar?m=${date.slice(0, 7)}&d=${date}`}
                    scroll={false}
                    data-date={date}
                    data-340b={window340b ? "true" : undefined}
                    data-today={isToday ? "true" : undefined}
                    data-selected={isSelected ? "true" : undefined}
                    aria-label={`${date}, ${events.length} ${events.length === 1 ? "event" : "events"}`}
                    aria-current={isToday ? "date" : undefined}
                    title={window340b ? "340B registration window" : undefined}
                    className={`relative block min-h-[96px] min-w-0 rounded-xl border p-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                      window340b ? "bg-[#b8893c]/15" : "bg-white/40 dark:bg-white/5"
                    } ${inMonth ? "" : "opacity-45"} ${
                      isSelected
                        ? "border-[var(--brand-gold)] ring-2 ring-[var(--brand-gold)]/70"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <span
                      className={`mb-1 inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-semibold ${
                        isToday ? "bg-[var(--accent)] text-white" : "text-[var(--heading)]"
                      }`}
                    >
                      {Number(date.slice(8))}
                    </span>
                    <span className="block space-y-0.5">
                      {events.slice(0, MAX_CHIPS).map((e) => (
                        <EventChip key={`${e.kind}-${e.id}`} event={e} />
                      ))}
                      {events.length > MAX_CHIPS && (
                        <span className="block px-1 text-[10px] font-medium text-[var(--muted)]">
                          +{events.length - MAX_CHIPS} more
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </MonthTransition>
    </div>
  );
}
