import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DayForms } from "./DayForms";
import { KIND_LABEL } from "./EventChip";
import type { CalendarEvent, HospitalOption } from "./types";

const dayTitle = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** Everything on the selected day, with quick-add forms for the owner. */
export function DayPanel({
  day,
  events,
  hospitals,
  isOwner,
}: {
  day: string;
  events: CalendarEvent[];
  hospitals: HospitalOption[];
  isOwner: boolean;
}) {
  return (
    <Card title={dayTitle(day)} className="scroll-mt-4">
      {events.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nothing on this day.</p>
      ) : (
        <ul aria-label="Events on this day" className="space-y-2">
          {events.map((e) => (
            <li key={`${e.kind}-${e.id}`} className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">{e.title}</span>
                {e.detail && <span className="block text-xs text-[var(--muted)]">{e.detail}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {e.overdue && <Badge tone="danger">Overdue</Badge>}
                <Badge tone={e.kind === "dependency" ? "warn" : "info"}>{KIND_LABEL[e.kind]}</Badge>
                {e.href && (
                  <Link href={e.href} className="text-xs font-semibold text-[var(--link)] hover:underline">
                    Open
                  </Link>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {isOwner && <DayForms key={day} day={day} hospitals={hospitals} />}
    </Card>
  );
}
