import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { canEdit } from "@/domain/roles";
import { CalendarView, type UpcomingDependency } from "@/components/calendar/CalendarView";
import type { CalendarEvent } from "@/components/calendar/types";
import { groupByDay, monthGrid, monthKey, parseDay, parseMonth } from "@/domain/calendar";
import { isOverdue } from "@/domain/dependencies";
import { next340bWindow } from "@/domain/windows340b";

type Named = { id: string; name: string } | null;

const pad = (n: number) => String(n).padStart(2, "0");
// Meetings are entered and shown in the server's time zone, so their day is read the same way.
const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const DAY_MS = 86_400_000;
const KIND_ORDER = { meeting: 0, dependency: 1, todo: 2 } as const;

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const { m, d } = await searchParams;
  const now = new Date();
  const today = localDay(now);
  const ym = parseMonth(m, now);
  const weeks = monthGrid(ym);
  const rangeStart = weeks[0][0].date;
  const rangeEnd = weeks[weeks.length - 1][6].date;

  // With no valid day in the URL, open today's panel when the visible month contains it.
  const requested = parseDay(d);
  const selected = requested ?? (today.startsWith(monthKey(ym)) ? today : null);

  // Meetings are stored in UTC; widen the query by a day on each side and filter by local day afterwards.
  const meetingFrom = fmtDate(new Date(new Date(`${rangeStart}T00:00:00Z`).getTime() - DAY_MS));
  const meetingTo = fmtDate(new Date(new Date(`${rangeEnd}T00:00:00Z`).getTime() + 2 * DAY_MS));

  const supabase = await createClient();
  const [role, deps, meetings, todos, overdueDeps, hospitals, allTodos, upcomingDeps] = await Promise.all([
    getSessionRole(),
    supabase
      .from("dependencies")
      .select("id, title, type, due_date, status, projects(id, name)")
      .gte("due_date", rangeStart)
      .lte("due_date", rangeEnd)
      .neq("status", "done"),
    supabase.from("meetings").select("id, title, starts_at").gte("starts_at", meetingFrom).lt("starts_at", meetingTo),
    supabase.from("todos").select("id, title, due_date").eq("done", false).gte("due_date", rangeStart).lte("due_date", rangeEnd),
    // Overdue and upcoming are fetched separately so a pile of old overdue items can never hide what is coming.
    supabase
      .from("dependencies")
      .select("id, title, type, due_date, status, projects(id, name)")
      .neq("status", "done")
      .lt("due_date", today)
      .order("due_date", { ascending: false })
      .limit(4),
    supabase.from("projects").select("id, name").eq("kind", "hospital").order("name"),
    // The to-do panel lists every to-do, including those with no date that the grid cannot show.
    supabase
      .from("todos")
      .select("id, title, due_date, done")
      .order("done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(200),
    supabase
      .from("dependencies")
      .select("id, title, type, due_date, status, projects(id, name)")
      .neq("status", "done")
      .gte("due_date", today)
      .order("due_date")
      .limit(8),
  ]);

  const events: CalendarEvent[] = [
    ...(deps.data ?? []).map((x) => {
      const p = x.projects as unknown as Named;
      return {
        id: x.id,
        date: x.due_date,
        kind: "dependency" as const,
        title: x.title,
        detail: `${p?.name ?? ""} · ${x.type}`,
        overdue: isOverdue(x.due_date, x.status),
        href: p ? `/hospitals/${p.id}` : undefined,
        meta: { projectId: p?.id, type: x.type, status: x.status },
      };
    }),
    ...(meetings.data ?? [])
      .map((x) => ({ x, at: new Date(x.starts_at) }))
      .filter(({ at }) => localDay(at) >= rangeStart && localDay(at) <= rangeEnd)
      .map(({ x, at }) => ({
        id: x.id,
        date: localDay(at),
        kind: "meeting" as const,
        title: x.title,
        detail: at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        meta: { startsAt: `${localDay(at)}T${pad(at.getHours())}:${pad(at.getMinutes())}` },
      })),
    ...(todos.data ?? []).map((x) => ({
      id: x.id,
      date: x.due_date as string,
      kind: "todo" as const,
      title: x.title,
    })),
  ].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.title.localeCompare(b.title));

  const win = next340bWindow(now);
  const upcomingList: UpcomingDependency[] = [...(overdueDeps.data ?? []), ...(upcomingDeps.data ?? [])].map((x) => ({
    id: x.id,
    title: x.title,
    type: x.type,
    due_date: x.due_date,
    status: x.status,
    project: (x.projects as unknown as Named)?.name ?? "",
  }));

  return (
    <CalendarView
      ym={ym}
      weeks={weeks}
      eventsByDay={groupByDay(events)}
      today={today}
      selected={selected}
      upcoming={upcomingList}
      todos={allTodos.data ?? []}
      window340b={{ start: fmtDate(win.start), end: fmtDate(win.end), isOpen: win.isOpen }}
      hospitals={hospitals.data ?? []}
      canEdit={canEdit(role)}
    />
  );
}
