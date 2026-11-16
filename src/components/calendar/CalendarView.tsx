import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { isOverdue } from "@/domain/dependencies";
import { monthKey, shiftMonth, type DayCell, type YearMonth } from "@/domain/calendar";
import { DayPanel } from "./DayPanel";
import { MonthGrid } from "./MonthGrid";
import { TodoPanel, type TodoRow } from "./TodoPanel";
import type { CalendarEvent, HospitalOption } from "./types";

export type UpcomingDependency = { id: string; title: string; type: string; due_date: string; status: string; project: string };

export type CalendarViewData = {
  ym: YearMonth;
  weeks: DayCell[][];
  eventsByDay: Record<string, CalendarEvent[]>;
  today: string;
  selected: string | null;
  upcoming: UpcomingDependency[];
  todos: TodoRow[];
  window340b: { start: string; end: string; isOpen: boolean };
  hospitals: HospitalOption[];
  isOwner: boolean;
};

const monthTitle = (ym: YearMonth) =>
  new Date(Date.UTC(ym.year, ym.month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const NAV_BTN =
  "grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-white/50 text-[var(--heading)] transition-transform hover:-translate-y-0.5 dark:bg-white/10";

function Legend() {
  const dot = "inline-block h-2.5 w-2.5 rounded-sm";
  return (
    <ul aria-label="Legend" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
      <li className="flex items-center gap-1.5"><span className={`${dot} bg-[#f1dca7]`} />Dependency</li>
      <li className="flex items-center gap-1.5"><span className={`${dot} bg-[#f4b8b0]`} />Overdue</li>
      <li className="flex items-center gap-1.5"><span className={`${dot} bg-[#6b1f2a]`} />Meeting</li>
      <li className="flex items-center gap-1.5"><span className={`${dot} bg-[#3a332c]`} />To-do</li>
      <li className="flex items-center gap-1.5"><span className={`${dot} border border-[#b8893c]/60 bg-[#b8893c]/25`} />340B window</li>
    </ul>
  );
}

/** Pure view of the calendar page: all data arrives as props, so it needs no database to render or test. */
export function CalendarView({ ym, weeks, eventsByDay, today, selected, upcoming, todos, window340b, hospitals, isOwner }: CalendarViewData) {
  const key = monthKey(ym);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--heading)]">{monthTitle(ym)}</h2>
        <div className="flex items-center gap-2">
          <Link href={`/calendar?m=${monthKey(shiftMonth(ym, -1))}`} aria-label="Previous month" className={NAV_BTN}>
            <ChevronLeft size={17} />
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg border border-[var(--border)] bg-white/50 px-3.5 py-2 text-xs font-semibold text-[var(--heading)] transition-transform hover:-translate-y-0.5 dark:bg-white/10"
          >
            Today
          </Link>
          <Link href={`/calendar?m=${monthKey(shiftMonth(ym, 1))}`} aria-label="Next month" className={NAV_BTN}>
            <ChevronRight size={17} />
          </Link>
        </div>
      </div>

      <Legend />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <MonthGrid monthKey={key} weeks={weeks} eventsByDay={eventsByDay} today={today} selected={selected} />

        <aside className="space-y-4">
          {selected && <DayPanel day={selected} events={eventsByDay[selected] ?? []} hospitals={hospitals} isOwner={isOwner} />}

          <TodoPanel todos={todos} isOwner={isOwner} />

          <Card title="340B registration window" delay={0.1}>
            <p className="text-sm">
              {window340b.start} to {window340b.end}{" "}
              <Badge tone={window340b.isOpen ? "ok" : "warn"}>
                {window340b.isOpen ? "Open now" : `Opens ${window340b.start}`}
              </Badge>
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              New 340B registrations are accepted only from the 1st to the 15th of January, April, July and October.
            </p>
          </Card>

          <Card title="Dependency deadlines" delay={0.15}>
            {upcoming.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No open dependencies.</p>
            ) : (
              <ul aria-label="Dependency deadlines" className="space-y-2 text-sm">
                {upcoming.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="font-medium">{d.title}</span>
                      <span className="block text-xs text-[var(--muted)]">{d.project} · {d.type}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs">{d.due_date}</span>
                      {isOverdue(d.due_date, d.status) && <Badge tone="danger">Overdue</Badge>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
